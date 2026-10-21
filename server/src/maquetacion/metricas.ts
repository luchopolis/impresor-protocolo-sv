/**
 * Anchos de glifo (unidades por 1000 em) para estimar el ancho de un renglón sin navegador.
 * Arial es métricamente compatible con Helvetica y Times New Roman con Times-Roman, por lo que
 * se usan las tablas AFM estándar de Adobe. Courier New es monoespaciada (600).
 */

const ORDEN_ASCII = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~`;

// prettier-ignore
const HELVETICA = [
  278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,
  556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,
  667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,
  278,278,278,469,556,333,
  556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,
  334,260,334,584,
];

// prettier-ignore
const TIMES = [
  250,333,408,500,500,833,778,180,333,333,500,564,250,333,250,278,
  500,500,500,500,500,500,500,500,500,500,278,278,564,564,564,444,921,
  722,667,667,722,611,556,722,722,333,389,722,611,889,722,722,556,722,667,556,611,722,722,944,722,722,611,
  333,278,333,469,500,333,
  444,500,444,500,444,333,500,500,278,278,500,278,778,500,500,500,500,333,389,278,500,500,722,500,500,444,
  480,200,480,541,
];

type Tabla = Map<string, number>;

function construir(anchos: number[], extras: Record<string, number>): Tabla {
  const t: Tabla = new Map();
  [...ORDEN_ASCII].forEach((c, i) => t.set(c, anchos[i]));
  for (const [c, w] of Object.entries(extras)) t.set(c, w);
  return t;
}

const TABLAS: Record<string, Tabla> = {
  arial: construir(HELVETICA, { '¿': 611, '¡': 333, '«': 556, '»': 556, 'º': 365, 'ª': 370, '°': 400, '“': 333, '”': 333, '‘': 222, '’': 222, '–': 556, '—': 1000, '…': 1000 }),
  times: construir(TIMES, { '¿': 444, '¡': 333, '«': 500, '»': 500, 'º': 310, 'ª': 276, '°': 400, '“': 444, '”': 444, '‘': 333, '’': 333, '–': 500, '—': 1000, '…': 1000 }),
};

function tablaPara(fuente: string): Tabla | null {
  const f = fuente.toLowerCase();
  if (f.includes('courier') || f.includes('mono')) return null;
  if (f.includes('times') || (f.includes('serif') && !f.includes('sans'))) return TABLAS.times;
  return TABLAS.arial;
}

/** Quita diacríticos para reutilizar el ancho de la letra base (á→a, Ñ→N). */
function base(c: string): string {
  return c.normalize('NFD').replace(/\p{M}/gu, '');
}

export interface Medidor {
  /** Ancho en puntos de una cadena. */
  ancho(texto: string): number;
  espacio: number;
  guion: number;
}

export function crearMedidor(fuente: string, tamanoPt: number): Medidor {
  const tabla = tablaPara(fuente);
  const cache = new Map<string, number>();

  const unidad = (c: string): number => {
    if (!tabla) return 600;
    let w = tabla.get(c);
    if (w === undefined) w = tabla.get(base(c)[0] ?? '') ?? (tabla === TABLAS.times ? 500 : 556);
    return w;
  };

  const ancho = (texto: string): number => {
    let w = cache.get(texto);
    if (w === undefined) {
      w = 0;
      for (const c of texto) w += unidad(c);
      w = (w / 1000) * tamanoPt;
      cache.set(texto, w);
    }
    return w;
  };

  return { ancho, espacio: ancho(' '), guion: ancho('-') };
}
