import {
  decimalALetras,
  digitosALetras,
  enteroALetras,
  fechaALetras,
  horaALetras,
  montoALetras,
  ordinalALetras,
} from './numeroALetras.js';

/** Número con separador de miles opcional y decimales con punto: 1,250.50 | 1250.5 | 12 */
const NUM = String.raw`\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?`;
/** Ni letra ni dígito antes / después (evita partir palabras alfanuméricas). */
const INI = String.raw`(?<![\p{L}\d])`;
const FIN = String.raw`(?![\p{L}\d])`;
const COLETILLA_USD = String.raw`(?:\s+de\s+los\s+Estados\s+Unidos\s+de\s+Am[ée]rica)?`;

const re = (fuente: string, flags = 'giu') => new RegExp(fuente, flags);

function esFechaValida(d: number, m: number, a: number): boolean {
  if (m < 1 || m > 12 || d < 1) return false;
  return d <= new Date(Date.UTC(a, m, 0)).getUTCDate();
}

/** "A1234567" → "A uno dos tres cuatro cinco seis siete" */
function alfanumericoALetras(token: string): string {
  return (token.match(/[A-Za-z]+|\d/g) ?? [])
    .map((p) => (/\d/.test(p) ? digitosALetras(p) : p.toUpperCase()))
    .join(' ');
}

type Regla = { nombre: string; patron: RegExp; reemplazo: (...m: string[]) => string };

/**
 * Reglas en orden de prioridad. Cada regla consume sus dígitos y produce palabras,
 * por lo que las reglas posteriores nunca vuelven a procesar lo ya convertido.
 */
const REGLAS: Regla[] = [
  {
    nombre: 'fecha dd/mm/aaaa',
    patron: re(String.raw`${INI}(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})${FIN}`),
    reemplazo: (orig, d, m, a) =>
      esFechaValida(+d, +m, +a) ? fechaALetras(+d, +m, +a) : orig,
  },
  {
    nombre: 'fecha ISO aaaa-mm-dd',
    patron: re(String.raw`${INI}(\d{4})-(\d{1,2})-(\d{1,2})${FIN}`),
    reemplazo: (orig, a, m, d) =>
      esFechaValida(+d, +m, +a) ? fechaALetras(+d, +m, +a) : orig,
  },
  {
    nombre: 'hora',
    patron: re(
      String.raw`${INI}(\d{1,2}):(\d{2})(?:\s*([ap])\.?\s?m\.?(?![\p{L}]))?(?:\s*(?:horas|hrs\.?|h)(?![\p{L}]))?`,
    ),
    reemplazo: (orig, hh, mm, ampm) => {
      let h = +hh;
      const m = +mm;
      if (m > 59) return orig;
      if (ampm) {
        if (h < 1 || h > 12) return orig;
        if (ampm.toLowerCase() === 'p' && h !== 12) h += 12;
        if (ampm.toLowerCase() === 'a' && h === 12) h = 0;
      }
      if (h > 23) return orig;
      return horaALetras(h, m);
    },
  },
  {
    nombre: 'monto con símbolo ($, US$, USD)',
    patron: re(
      String.raw`(?:US\s?\$|\$|USD\s?)\s?(${NUM})${FIN}(?:\s*(?:d[óo]lares|d[óo]lar)${COLETILLA_USD})?`,
    ),
    reemplazo: (_o, n) => montoALetras(n),
  },
  {
    nombre: 'monto con palabra dólares',
    patron: re(String.raw`${INI}(${NUM})\s*(?:d[óo]lares|d[óo]lar|USD)${FIN}${COLETILLA_USD}`),
    reemplazo: (_o, n) => montoALetras(n),
  },
  {
    nombre: 'porcentaje',
    patron: re(String.raw`${INI}(${NUM})\s?%`),
    reemplazo: (_o, n) => `${decimalALetras(n)} por ciento`,
  },
  {
    nombre: 'pasaporte',
    patron: re(
      String.raw`(pasaporte(?:\s+(?:n[úu]mero|no\.|n[°º]))?\s*:?\s+)([A-Za-z]{0,3}\d[A-Za-z0-9]{2,})${FIN}`,
    ),
    reemplazo: (_o, prefijo, token) => `${prefijo}${alfanumericoALetras(token)}`,
  },
  {
    nombre: 'documento con guiones (DUI, NIT, teléfono, matrícula)',
    patron: re(String.raw`${INI}\d+(?:-\d+)+${FIN}`),
    reemplazo: (orig) => orig.split('-').map(digitosALetras).join(' guion '),
  },
  {
    nombre: 'código alfanumérico (A1234567)',
    patron: re(String.raw`${INI}(?=[A-Z]*\d)(?=\d*[A-Z])[A-Z0-9]{4,}${FIN}`, 'gu'),
    reemplazo: (orig) => alfanumericoALetras(orig),
  },
  {
    nombre: 'ordinal (1°, 2º)',
    patron: re(String.raw`${INI}(\d{1,2})\s?[°º]`),
    reemplazo: (_o, n) => ordinalALetras(+n),
  },
  {
    nombre: 'cadena numérica (cero inicial o 10+ dígitos)',
    patron: re(String.raw`${INI}(?:0\d+|\d{10,})${FIN}(?![.,]\d)`),
    reemplazo: (orig) => digitosALetras(orig),
  },
  {
    nombre: 'número independiente',
    patron: re(String.raw`${INI}(${NUM})${FIN}`),
    reemplazo: (_o, n) => (n.includes('.') ? decimalALetras(n) : enteroALetras(Number(n.replace(/,/g, '')))),
  },
];

/** Reemplaza toda cifra del texto por su lectura literal legal en español. */
export function convertirCifrasALetras(texto: string): string {
  return REGLAS.reduce((acc, r) => acc.replace(r.patron, r.reemplazo as (s: string, ...a: string[]) => string), texto);
}

/**
 * Limpieza previa: elimina viñetas, marcas de negrita/cursiva Markdown y espacios repetidos.
 * Devuelve los párrafos no vacíos (cada salto de línea del original delimita un párrafo).
 */
export function normalizarParrafos(texto: string): string[] {
  return texto
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((p) =>
      p
        .replace(/^\s*(?:[-•*·▪●◦–—]|\d+[.)])\s+/u, (m) => (/\d/.test(m) ? m : ''))
        .replace(/\*\*|__|(?<!\w)[*_](?=\S)|(?<=\S)[*_](?!\w)/g, '')
        .replace(/\t/g, ' ')
        .replace(/ {2,}/g, ' ')
        .trim(),
    )
    .filter((p) => p.length > 0);
}

export function procesarTexto(texto: string, convertirNumeros = true): string[] {
  const parrafos = normalizarParrafos(texto);
  return convertirNumeros ? parrafos.map(convertirCifrasALetras) : parrafos;
}
