/**
 * Conversión de cifras a su lectura literal en español, según el uso notarial salvadoreño.
 *
 * Género:
 *  - 'neutro'    → forma de cita: "uno", "veintiuno", "treinta y uno".
 *  - 'masculino' → apócope ante sustantivo masculino: "un dólar", "veintiún minutos".
 *  - 'femenino'  → "una hora", "veintiuna horas", "doscientas".
 */
export type Genero = 'neutro' | 'masculino' | 'femenino';

const UNIDADES = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis',
  'veintisiete', 'veintiocho', 'veintinueve',
];
const DECENAS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const CENTENAS = [
  '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
];

export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const DIGITOS = UNIDADES.slice(0, 10);

function uno(genero: Genero): string {
  return genero === 'masculino' ? 'un' : genero === 'femenino' ? 'una' : 'uno';
}

function menorQueCien(n: number, genero: Genero): string {
  if (n === 1) return uno(genero);
  if (n === 21) return genero === 'masculino' ? 'veintiún' : genero === 'femenino' ? 'veintiuna' : 'veintiuno';
  if (n < 30) return UNIDADES[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return DECENAS[d];
  return `${DECENAS[d]} y ${u === 1 ? uno(genero) : UNIDADES[u]}`;
}

function menorQueMil(n: number, genero: Genero): string {
  if (n === 0) return '';
  if (n === 100) return 'cien';
  const c = Math.floor(n / 100);
  const r = n % 100;
  const partes: string[] = [];
  if (c) partes.push(genero === 'femenino' && c > 1 ? CENTENAS[c].replace(/os$/, 'as') : CENTENAS[c]);
  if (r) partes.push(menorQueCien(r, genero));
  return partes.join(' ');
}

/** n < 1 000 000 */
function menorQueMillon(n: number, genero: Genero): string {
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  // "mil" concuerda con el sustantivo que sigue: "veintiún mil dólares", "veintiuna mil horas".
  if (miles === 1) partes.push('mil');
  else if (miles > 1) partes.push(`${menorQueMil(miles, genero === 'femenino' ? 'femenino' : 'masculino')} mil`);
  if (resto) partes.push(menorQueMil(resto, genero));
  return partes.join(' ');
}

/** Lectura literal de un entero no negativo (hasta Number.MAX_SAFE_INTEGER). */
export function enteroALetras(n: number, genero: Genero = 'neutro'): string {
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError(`Número fuera de rango: ${n}`);
  if (n === 0) return 'cero';

  const billones = Math.floor(n / 1e12);
  const millones = Math.floor((n % 1e12) / 1e6);
  const resto = n % 1e6;
  const partes: string[] = [];

  if (billones) partes.push(billones === 1 ? 'un billón' : `${menorQueMillon(billones, 'masculino')} billones`);
  if (millones) partes.push(millones === 1 ? 'un millón' : `${menorQueMillon(millones, 'masculino')} millones`);
  if (resto) partes.push(menorQueMillon(resto, genero));
  return partes.join(' ');
}

/** Lee una cadena de dígitos cifra por cifra: "0614" → "cero seis uno cuatro". */
export function digitosALetras(cadena: string): string {
  return cadena
    .split('')
    .filter((c) => /\d/.test(c))
    .map((c) => DIGITOS[Number(c)])
    .join(' ');
}

/**
 * Lectura de un número decimal escrito con punto: "12.5" → "doce punto cinco",
 * "0.05" → "cero punto cero cinco". Los ceros a la izquierda del decimal se leen uno a uno.
 */
export function decimalALetras(texto: string, genero: Genero = 'neutro'): string {
  const [ent, dec] = texto.replace(/,/g, '').split('.');
  const parteEntera = enteroALetras(Number(ent), genero);
  if (!dec) return parteEntera;
  const ceros = dec.match(/^0*/)![0];
  const significativa = dec.slice(ceros.length);
  const lecturaDec = [
    ...ceros.split('').map(() => 'cero'),
    ...(significativa ? [enteroALetras(Number(significativa))] : []),
  ].join(' ');
  return `${parteEntera} punto ${lecturaDec}`;
}

/** Monto en dólares: "1,250.50" → "mil doscientos cincuenta dólares de los Estados Unidos de América con cincuenta centavos de dólar". */
export function montoALetras(texto: string): string {
  const limpio = texto.replace(/,/g, '');
  const [ent, dec = ''] = limpio.split('.');
  const entero = Number(ent);
  const centavos = dec ? Math.round(Number(`0.${dec}`) * 100) : 0;

  let base: string;
  if (entero === 1) base = 'un dólar';
  else {
    const letras = enteroALetras(entero, 'masculino');
    // "un millón de dólares", "dos billones de dólares"
    const de = entero > 0 && entero % 1e6 === 0 ? ' de' : '';
    base = `${letras}${de} dólares`;
  }
  base += ' de los Estados Unidos de América';

  if (centavos > 0) {
    base += centavos === 1
      ? ' con un centavo de dólar'
      : ` con ${enteroALetras(centavos, 'masculino')} centavos de dólar`;
  }
  return base;
}

/** Fecha: (15, 3, 2024) → "quince de marzo de dos mil veinticuatro". */
export function fechaALetras(dia: number, mes: number, anio: number): string {
  return `${enteroALetras(dia)} de ${MESES[mes - 1]} de ${enteroALetras(anio)}`;
}

/** Hora en formato de 24 horas: (14, 30) → "catorce horas y treinta minutos". */
export function horaALetras(horas: number, minutos: number): string {
  const h = horas === 1 ? 'una hora' : `${enteroALetras(horas, 'femenino')} horas`;
  if (minutos === 0) return h;
  const m = minutos === 1 ? 'un minuto' : `${enteroALetras(minutos, 'masculino')} minutos`;
  return `${h} y ${m}`;
}

const ORDINALES = [
  '', 'primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo', 'noveno', 'décimo',
];

/** Ordinal para "1°", "2º"…; a partir del 11 se usa la lectura cardinal. */
export function ordinalALetras(n: number): string {
  return ORDINALES[n] ?? enteroALetras(n);
}
