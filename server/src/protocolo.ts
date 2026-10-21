import { FUENTES_SOPORTADAS, LINEAS_POR_CARA } from './constantes.js';
import { maquetar } from './maquetacion/maquetador.js';
import { procesarTexto } from './texto/procesarTexto.js';
import { razonDeTestimonio } from './texto/razonTestimonio.js';
import {
  NUMEROS_TESTIMONIO,
  type FormatProtocolRequest,
  type FormatProtocolResponse,
  type ModoSalida,
  type NumeroTestimonio,
  type OpcionesTestimonio,
  type TamanoPapel,
  type TipoCara,
  type TipoDocumento,
} from './types.js';

const MODOS: ModoSalida[] = ['vista-previa', 'pagina-por-pagina', 'documento-completo', 'solo-frentes', 'solo-vueltos'];
const LADOS: TipoCara[] = ['frente', 'vuelto'];
const TIPOS: TipoDocumento[] = ['protocolo', 'testimonio'];
const PAPELES: TamanoPapel[] = ['carta', 'oficio'];
const MAX_CARACTERES = 300_000;

/** Petición con valores por defecto aplicados; `testimonio` solo existe para ese tipo de documento. */
export type PeticionValidada = Required<Omit<FormatProtocolRequest, 'testimonio'>> & { testimonio?: OpcionesTestimonio };

function esFechaIso(f: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
  const d = new Date(`${f}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(f);
}

function validarTestimonio(t: unknown, errores: string[]): OpcionesTestimonio | undefined {
  const o = (t ?? {}) as Partial<Record<keyof OpcionesTestimonio, unknown>>;
  const tamanoPapel = (o.tamanoPapel ?? 'carta') as TamanoPapel;
  if (!PAPELES.includes(tamanoPapel)) errores.push('"testimonio.tamanoPapel" debe ser "carta" u "oficio".');
  const interlineado = Number(o.interlineado ?? 1.5);
  if (!(interlineado >= 1 && interlineado <= 3)) errores.push('"testimonio.interlineado" debe estar entre 1 y 3.');
  const libroNumero = Number(o.libroNumero);
  if (!Number.isInteger(libroNumero) || libroNumero < 1) errores.push('"testimonio.libroNumero" debe ser un entero ≥ 1.');
  const folioInicial = Number(o.folioInicial);
  const folioFinal = Number(o.folioFinal);
  if (!Number.isInteger(folioInicial) || folioInicial < 1) errores.push('"testimonio.folioInicial" debe ser un entero ≥ 1.');
  else if (!Number.isInteger(folioFinal) || folioFinal < folioInicial) {
    errores.push('"testimonio.folioFinal" debe ser un entero mayor o igual que el folio inicial.');
  }
  const nombreCliente = typeof o.nombreCliente === 'string' ? o.nombreCliente.trim() : '';
  if (!nombreCliente) errores.push('"testimonio.nombreCliente" es obligatorio.');
  const numeroTestimonio = String(o.numeroTestimonio ?? 'PRIMER').toUpperCase() as NumeroTestimonio;
  if (!NUMEROS_TESTIMONIO.includes(numeroTestimonio)) {
    errores.push(`"testimonio.numeroTestimonio" debe ser uno de: ${NUMEROS_TESTIMONIO.join(', ')}.`);
  }
  const fechaExpedicion = String(o.fechaExpedicion ?? '');
  if (!esFechaIso(fechaExpedicion)) errores.push('"testimonio.fechaExpedicion" debe ser una fecha AAAA-MM-DD válida.');
  const ciudad = typeof o.ciudad === 'string' && o.ciudad.trim() ? o.ciudad.trim() : 'San Salvador';
  return { tamanoPapel, interlineado, libroNumero, folioInicial, folioFinal, nombreCliente, numeroTestimonio, fechaExpedicion, ciudad };
}

export class ErrorValidacion extends Error {
  constructor(public readonly detalles: string[]) {
    super('Petición inválida');
  }
}

/** Valida y normaliza el cuerpo recibido. Lanza ErrorValidacion con la lista de problemas. */
export function validarPeticion(body: unknown): PeticionValidada {
  const b = (body ?? {}) as Partial<Record<keyof FormatProtocolRequest, unknown>>;
  const errores: string[] = [];

  const texto = typeof b.texto === 'string' ? b.texto : '';
  if (!texto.trim()) errores.push('"texto" es obligatorio.');
  if (texto.length > MAX_CARACTERES) errores.push(`"texto" excede ${MAX_CARACTERES} caracteres.`);

  const lineaInicio = Number(b.lineaInicio ?? 1);
  if (!Number.isInteger(lineaInicio) || lineaInicio < 1 || lineaInicio > LINEAS_POR_CARA) {
    errores.push(`"lineaInicio" debe ser un entero entre 1 y ${LINEAS_POR_CARA}.`);
  }

  const tamanoFuente = String(b.tamanoFuente ?? '12pt').trim();
  const tamanoPt = parseFloat(tamanoFuente);
  if (!/^\d+(\.\d+)?\s*pt$/i.test(tamanoFuente) || tamanoPt < 8 || tamanoPt > 16) {
    errores.push('"tamanoFuente" debe tener el formato "12pt" y estar entre 8pt y 16pt.');
  }

  const tipoFuente = String(b.tipoFuente ?? 'Arial').trim();
  if (!/^[\p{L}\d \-]{2,40}$/u.test(tipoFuente)) errores.push('"tipoFuente" no es un nombre de fuente válido.');

  const ladoInicial = (b.ladoInicial ?? 'frente') as TipoCara;
  if (!LADOS.includes(ladoInicial)) errores.push('"ladoInicial" debe ser "frente" o "vuelto".');

  const modoSalida = (b.modoSalida ?? 'vista-previa') as ModoSalida;
  if (!MODOS.includes(modoSalida)) errores.push(`"modoSalida" debe ser uno de: ${MODOS.join(', ')}.`);

  const folioInicial = Number(b.folioInicial ?? 1);
  if (!Number.isInteger(folioInicial) || folioInicial < 1) errores.push('"folioInicial" debe ser un entero ≥ 1.');

  const lineasFirma = Number(b.lineasFirma ?? 4);
  if (!Number.isInteger(lineasFirma) || lineasFirma < 0 || lineasFirma > 12) {
    errores.push('"lineasFirma" debe ser un entero entre 0 y 12.');
  }

  const tipoDocumento = (b.tipoDocumento ?? 'protocolo') as TipoDocumento;
  if (!TIPOS.includes(tipoDocumento)) errores.push('"tipoDocumento" debe ser "protocolo" o "testimonio".');
  const testimonio = tipoDocumento === 'testimonio' ? validarTestimonio(b.testimonio, errores) : undefined;

  if (errores.length) throw new ErrorValidacion(errores);

  return {
    tipoDocumento,
    testimonio,
    texto,
    lineaInicio,
    tamanoFuente: `${tamanoPt}pt`,
    tipoFuente,
    ladoInicial,
    modoSalida,
    folioInicial,
    lineasFirma,
    convertirNumeros: b.convertirNumeros !== false,
    rellenarGuiones: b.rellenarGuiones !== false,
  };
}

/** Testimonio: texto de corrido en papel bond; no se maqueta en caras de 24 renglones. */
function formatearTestimonio(peticion: PeticionValidada, opciones: OpcionesTestimonio): FormatProtocolResponse {
  const parrafos = procesarTexto(peticion.texto, peticion.convertirNumeros);
  const razon = razonDeTestimonio({ ...opciones, enLetras: peticion.convertirNumeros });
  const todos = [...parrafos, razon];
  return {
    tipoDocumento: 'testimonio',
    pages: [],
    testimonio: {
      parrafos: todos,
      razon,
      tamanoPapel: opciones.tamanoPapel,
      interlineado: opciones.interlineado,
      folioInicial: opciones.folioInicial,
      folioFinal: opciones.folioFinal,
    },
    meta: {
      totalCaras: 0,
      totalFolios: 0,
      lineasPorCara: LINEAS_POR_CARA,
      tipoFuente: peticion.tipoFuente,
      tamanoFuente: peticion.tamanoFuente,
      modoSalida: peticion.modoSalida,
      textoProcesado: todos.join('\n'),
      advertencias: [],
    },
  };
}

export function formatearProtocolo(peticion: PeticionValidada): FormatProtocolResponse {
  if (peticion.tipoDocumento === 'testimonio' && peticion.testimonio) {
    return formatearTestimonio(peticion, peticion.testimonio);
  }

  const parrafos = procesarTexto(peticion.texto, peticion.convertirNumeros);
  const { caras, advertencias } = maquetar(parrafos, {
    lineaInicio: peticion.lineaInicio,
    tipoFuente: peticion.tipoFuente,
    tamanoPt: parseFloat(peticion.tamanoFuente),
    ladoInicial: peticion.ladoInicial,
    folioInicial: peticion.folioInicial,
    lineasFirma: peticion.lineasFirma,
    rellenarGuiones: peticion.rellenarGuiones,
  });

  if (!FUENTES_SOPORTADAS.some((f) => f.toLowerCase() === peticion.tipoFuente.toLowerCase())) {
    advertencias.push(
      `La fuente "${peticion.tipoFuente}" no tiene métricas propias; el corte de renglones se estimó con métricas de Arial.`,
    );
  }

  const pages =
    peticion.modoSalida === 'solo-frentes'
      ? caras.filter((c) => c.type === 'frente')
      : peticion.modoSalida === 'solo-vueltos'
        ? caras.filter((c) => c.type === 'vuelto')
        : caras;

  return {
    tipoDocumento: 'protocolo',
    pages,
    meta: {
      totalCaras: caras.length,
      totalFolios: new Set(caras.map((c) => c.folioNum)).size,
      lineasPorCara: LINEAS_POR_CARA,
      tipoFuente: peticion.tipoFuente,
      tamanoFuente: peticion.tamanoFuente,
      modoSalida: peticion.modoSalida,
      textoProcesado: parrafos.join('\n'),
      advertencias,
    },
  };
}
