import { LINEAS_POR_CARA, anchoUtilPt } from '../constantes.js';
import type { ProtocolPage, TipoCara } from '../types.js';
import { crearMedidor, type Medidor } from './metricas.js';

/**
 * Margen de seguridad sobre el ancho útil: el navegador justifica cada renglón, así que basta con
 * que la estimación nunca exceda la caja. Un 1.5 % absorbe diferencias de hinting y redondeo.
 */
const FACTOR_SEGURIDAD = 0.985;
const MIN_GUIONES = 2;

const CIERRE = /paso\s+ante\s+m[íi]/i;

export interface OpcionesMaquetacion {
  lineaInicio: number;
  tipoFuente: string;
  tamanoPt: number;
  ladoInicial: TipoCara;
  folioInicial: number;
  lineasFirma: number;
  rellenarGuiones: boolean;
}

interface Cara {
  type: TipoCara;
  folioNum: number;
  lineas: string[];
  finDeParrafo: number[];
}

/** Cursor de escritura sobre caras consecutivas del libro (frente → vuelto → frente del folio siguiente…). */
class Pliego {
  readonly caras: Cara[] = [];

  constructor(ladoInicial: TipoCara, folioInicial: number) {
    this.caras.push({ type: ladoInicial, folioNum: folioInicial, lineas: [], finDeParrafo: [] });
  }

  get actual(): Cara {
    return this.caras[this.caras.length - 1];
  }

  /** Renglones libres en la cara actual. */
  get libres(): number {
    return LINEAS_POR_CARA - this.actual.lineas.length;
  }

  /** Tipo de cara donde caerá el k-ésimo renglón a partir del cursor (k = 0 es el próximo). */
  tipoEn(k: number): TipoCara {
    const saltos = Math.floor((this.actual.lineas.length + k) / LINEAS_POR_CARA);
    return saltos % 2 === 0 ? this.actual.type : this.actual.type === 'frente' ? 'vuelto' : 'frente';
  }

  agregar(linea: string, finDeParrafo = false): void {
    if (finDeParrafo) this.actual.finDeParrafo.push(this.actual.lineas.length);
    this.actual.lineas.push(linea);
    if (this.actual.lineas.length === LINEAS_POR_CARA) this.nuevaCara();
  }

  nuevaCara(): void {
    const { type, folioNum } = this.actual;
    this.caras.push(
      type === 'frente'
        ? { type: 'vuelto', folioNum, lineas: [], finDeParrafo: [] }
        : { type: 'frente', folioNum: folioNum + 1, lineas: [], finDeParrafo: [] },
    );
  }

  /** Caras con exactamente 24 renglones; descarta una última cara vacía. */
  cerrar(): Cara[] {
    const caras = this.caras.filter((c, i) => c.lineas.length > 0 || i === 0);
    for (const c of caras) while (c.lineas.length < LINEAS_POR_CARA) c.lineas.push('');
    return caras;
  }
}

class Compositor {
  constructor(
    private readonly medidor: Medidor,
    private readonly rellenar: boolean,
  ) {}

  private anchoMax(tipo: TipoCara): number {
    return anchoUtilPt(tipo) * FACTOR_SEGURIDAD;
  }

  /** Renglón compuesto exclusivamente de guiones, para inutilizar renglones sobrantes. */
  lineaDeGuiones(tipo: TipoCara): string {
    return '-'.repeat(Math.floor(this.anchoMax(tipo) / this.medidor.guion));
  }

  /**
   * Divide un párrafo en renglones (algoritmo voraz). `tipoDe(i)` indica en qué cara caerá el
   * renglón i, porque frente y vuelto tienen anchos útiles distintos.
   */
  componer(parrafo: string, tipoDe: (i: number) => TipoCara): string[] {
    const { ancho, espacio } = this.medidor;
    const palabras = parrafo.split(' ').filter(Boolean);
    const renglones: string[] = [];
    let actual = '';
    let anchoActual = 0;

    const cortarPalabraLarga = (palabra: string): string[] => {
      const trozos: string[] = [];
      let trozo = '';
      for (const c of palabra) {
        if (ancho(trozo + c) > this.anchoMax(tipoDe(renglones.length + trozos.length))) {
          trozos.push(trozo);
          trozo = '';
        }
        trozo += c;
      }
      if (trozo) trozos.push(trozo);
      return trozos;
    };

    for (const palabra of palabras) {
      const max = this.anchoMax(tipoDe(renglones.length));
      const w = ancho(palabra);
      if (!actual) {
        if (w > max) {
          const trozos = cortarPalabraLarga(palabra);
          renglones.push(...trozos.slice(0, -1));
          actual = trozos[trozos.length - 1];
          anchoActual = ancho(actual);
        } else {
          actual = palabra;
          anchoActual = w;
        }
      } else if (anchoActual + espacio + w <= max) {
        actual += ' ' + palabra;
        anchoActual += espacio + w;
      } else {
        renglones.push(actual);
        actual = '';
        anchoActual = 0;
        // reintentar la palabra en el renglón nuevo
        const maxNuevo = this.anchoMax(tipoDe(renglones.length));
        if (w > maxNuevo) {
          const trozos = cortarPalabraLarga(palabra);
          renglones.push(...trozos.slice(0, -1));
          actual = trozos[trozos.length - 1];
        } else actual = palabra;
        anchoActual = ancho(actual);
      }
    }
    if (actual) renglones.push(this.rellenar ? this.rellenarConGuiones(actual, tipoDe(renglones.length)) : actual);
    return renglones;
  }

  /** Completa el último renglón del párrafo con guiones hasta el margen derecho. */
  private rellenarConGuiones(linea: string, tipo: TipoCara): string {
    const { ancho, espacio, guion } = this.medidor;
    const n = Math.floor((this.anchoMax(tipo) - ancho(linea) - espacio) / guion);
    return n >= MIN_GUIONES ? `${linea} ${'-'.repeat(n)}` : linea;
  }
}

/** Separa el cuerpo del instrumento del bloque de cierre ("Paso ante mí…" y lo que sigue). */
export function separarCierre(parrafos: string[]): { cuerpo: string[]; cierre: string[]; encontrado: boolean } {
  const idx = parrafos.findIndex((p) => CIERRE.test(p));
  if (idx === -1) {
    return { cuerpo: parrafos.slice(0, -1), cierre: parrafos.slice(-1), encontrado: false };
  }
  const p = parrafos[idx];
  const pos = p.search(CIERRE);
  const antes = p.slice(0, pos).trim();
  const desde = p.slice(pos).trim();
  return {
    cuerpo: [...parrafos.slice(0, idx), ...(antes ? [antes] : [])],
    cierre: [desde, ...parrafos.slice(idx + 1)],
    encontrado: true,
  };
}

export interface ResultadoMaquetacion {
  caras: ProtocolPage[];
  advertencias: string[];
}

export function maquetar(parrafos: string[], op: OpcionesMaquetacion): ResultadoMaquetacion {
  const advertencias: string[] = [];
  const medidor = crearMedidor(op.tipoFuente, op.tamanoPt);
  const compositor = new Compositor(medidor, op.rellenarGuiones);
  const pliego = new Pliego(op.ladoInicial, op.folioInicial);

  // Renglones anteriores a la línea de inicio quedan vacíos (ya usados por el instrumento anterior).
  for (let i = 1; i < op.lineaInicio; i++) pliego.agregar('');

  const { cuerpo, cierre, encontrado } = separarCierre(parrafos);
  if (!encontrado && parrafos.length > 0) {
    advertencias.push(
      'No se encontró la frase "Paso ante mí"; se tomó el último párrafo como bloque de cierre y firmas.',
    );
  }

  const agregarParrafo = (renglones: string[]) =>
    renglones.forEach((r, i) => pliego.agregar(r, i === renglones.length - 1));

  for (const parrafo of cuerpo) agregarParrafo(compositor.componer(parrafo, (i) => pliego.tipoEn(i)));

  // Bloque de cierre + firmas: nunca se parte entre caras. Si el cuerpo terminó justo en el
  // renglón 24 del frente, el cursor ya está en el renglón 1 del vuelto y el bloque cae allí.
  const componerCierre = () => {
    const parrafosCierre: string[][] = [];
    let desplazamiento = 0;
    for (const p of cierre) {
      const renglones = compositor.componer(p, (i) => pliego.tipoEn(desplazamiento + i));
      desplazamiento += renglones.length;
      parrafosCierre.push(renglones);
    }
    return { parrafosCierre, total: desplazamiento + op.lineasFirma };
  };

  let bloque = componerCierre();
  if (bloque.total > pliego.libres && bloque.total <= LINEAS_POR_CARA) {
    const desplazados = pliego.libres;
    const tipo = pliego.actual.type;
    while (pliego.libres < LINEAS_POR_CARA && pliego.actual.lineas.length > 0) {
      pliego.agregar(compositor.lineaDeGuiones(tipo));
    }
    advertencias.push(
      `El cierre y las firmas no cabían en el ${tipo} del folio ${pliego.caras[pliego.caras.length - 2].folioNum}; ` +
        `se inutilizaron ${desplazados} renglón(es) con guiones y el bloque pasó a la cara siguiente.`,
    );
    bloque = componerCierre();
  } else if (bloque.total > LINEAS_POR_CARA) {
    advertencias.push('El bloque de cierre excede 24 renglones y no puede mantenerse en una sola cara.');
  }
  bloque.parrafosCierre.forEach(agregarParrafo);
  for (let i = 0; i < op.lineasFirma; i++) pliego.agregar('');

  const caras = pliego.cerrar().map((c, i) => ({
    id: i + 1,
    folioNum: c.folioNum,
    type: c.type,
    content: c.lineas.join('\n'),
    finDeParrafo: c.finDeParrafo,
  }));
  return { caras, advertencias };
}
