/** Cara de un folio del Libro de Protocolo. */
export type TipoCara = 'frente' | 'vuelto';

export type ModoSalida =
  | 'vista-previa'
  | 'pagina-por-pagina'
  | 'documento-completo'
  | 'solo-frentes'
  | 'solo-vueltos';

/** "protocolo": hoja del Libro de Protocolo (24 renglones). "testimonio": copia en papel bond de corrido. */
export type TipoDocumento = 'protocolo' | 'testimonio';

export type TamanoPapel = 'carta' | 'oficio';

export const NUMEROS_TESTIMONIO = [
  'PRIMER', 'SEGUNDO', 'TERCER', 'CUARTO', 'QUINTO', 'SEXTO', 'SÉPTIMO', 'OCTAVO', 'NOVENO', 'DÉCIMO',
] as const;
export type NumeroTestimonio = (typeof NUMEROS_TESTIMONIO)[number];

/** Datos de la Razón de Testimonio. */
export interface OpcionesTestimonio {
  tamanoPapel: TamanoPapel;
  /** Interlineado como múltiplo del tamaño de fuente (p. ej. 1.5). */
  interlineado: number;
  /** Número del Libro de Protocolo. */
  libroNumero: number;
  /** Folios del protocolo donde está asentada la escritura (los indica el notario). */
  folioInicial: number;
  folioFinal: number;
  /** Persona para cuya seguridad se expide el testimonio. */
  nombreCliente: string;
  numeroTestimonio: NumeroTestimonio;
  /** Fecha de expedición en formato AAAA-MM-DD. */
  fechaExpedicion: string;
  /** Ciudad de expedición (por defecto "San Salvador"). */
  ciudad?: string;
}

/** Cuerpo de la petición POST /api/format-protocol. */
export interface FormatProtocolRequest {
  /** Por defecto "protocolo". */
  tipoDocumento?: TipoDocumento;
  /** Obligatorio cuando tipoDocumento = "testimonio". */
  testimonio?: OpcionesTestimonio;
  /** Texto legal en bruto. Cada salto de línea delimita un párrafo. */
  texto: string;
  /** Línea (1–24) donde arranca el texto en la primera cara. */
  lineaInicio: number;
  /** Tamaño de fuente, p. ej. "12pt". */
  tamanoFuente: string;
  /** Familia tipográfica, p. ej. "Arial". */
  tipoFuente: string;
  /** Cara en la que inicia el instrumento. */
  ladoInicial: TipoCara;
  modoSalida: ModoSalida;
  /** Número del folio donde inicia el instrumento (por defecto 1). */
  folioInicial?: number;
  /** Renglones en blanco reservados para firmas tras el cierre (por defecto 4). */
  lineasFirma?: number;
  /** Convierte números, fechas, horas, montos, etc. a letras (por defecto true). */
  convertirNumeros?: boolean;
  /** Rellena con guiones el final de cada párrafo (por defecto true). */
  rellenarGuiones?: boolean;
}

export interface ProtocolPage {
  id: number;
  folioNum: number;
  type: TipoCara;
  /** Exactamente 24 renglones separados por "\n". */
  content: string;
  /** Índices (base 0) de los renglones que cierran un párrafo: no se justifican si no llevan guiones. */
  finDeParrafo: number[];
}

/** Testimonio: texto de corrido (sin cortes cada 24 renglones) más la Razón de Testimonio. */
export interface TestimonioResultado {
  /** Párrafos del instrumento ya procesados; el último es la Razón de Testimonio. */
  parrafos: string[];
  razon: string;
  tamanoPapel: TamanoPapel;
  interlineado: number;
  /** Folios que ocupa el instrumento en el Libro de Protocolo. */
  folioInicial: number;
  folioFinal: number;
}

export interface FormatProtocolResponse {
  tipoDocumento: TipoDocumento;
  /** Caras del protocolo; vacío cuando tipoDocumento = "testimonio". */
  pages: ProtocolPage[];
  testimonio?: TestimonioResultado;
  meta: {
    totalCaras: number;
    totalFolios: number;
    lineasPorCara: number;
    tipoFuente: string;
    tamanoFuente: string;
    modoSalida: ModoSalida;
    textoProcesado: string;
    advertencias: string[];
  };
}

export interface ErrorResponse {
  error: string;
  detalles?: string[];
}
