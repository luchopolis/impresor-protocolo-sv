import type { ModoSalida, TamanoPapel, TipoCara } from './types';

/** Debe coincidir con server/src/constantes.ts (normativa CSJ). Centímetros. */
export const PAPEL = { anchoCm: 21.0, altoCm: 28.0 } as const;
export const LINEAS_POR_CARA = 24;
export const INTERLINEADO_PT = 24;

export const MARGENES: Record<TipoCara, { sup: number; inf: number; izq: number; der: number }> = {
  frente: { sup: 4.46, inf: 2.46, izq: 3.0, der: 1.1 },
  vuelto: { sup: 2.8, inf: 4.46, izq: 1.3, der: 3.1 },
};

/**
 * El testimonio sigue implementado (API y vista paginada), pero por ahora solo se ofrece el
 * protocolo: los testimonios se redactan en Word. Cambie a true para volver a mostrar el selector.
 */
export const MOSTRAR_TESTIMONIO = false;

export const FUENTES = ['Arial', 'Times New Roman', 'Courier New'];

/** font-family CSS con respaldo genérico adecuado. */
export function familiaCss(tipoFuente: string): string {
  const generica = /courier/i.test(tipoFuente) ? 'monospace' : /times/i.test(tipoFuente) ? 'serif' : 'sans-serif';
  return `"${tipoFuente}", ${generica}`;
}

/** Papel bond para testimonios (cm). Oficio salvadoreño: 8.5 × 13 pulgadas. */
export const PAPELES_TESTIMONIO: Record<TamanoPapel, { anchoCm: number; altoCm: number; etiqueta: string }> = {
  carta: { anchoCm: 21.59, altoCm: 27.94, etiqueta: 'Carta' },
  oficio: { anchoCm: 21.59, altoCm: 33.02, etiqueta: 'Oficio' },
};
export const MARGEN_TESTIMONIO_CM = 2.5;
export const TAMANOS = ['10pt', '10.5pt', '11pt', '11.5pt', '12pt', '13pt', '14pt'];

export const MODOS: { valor: ModoSalida; etiqueta: string }[] = [
  { valor: 'vista-previa', etiqueta: 'Vista previa' },
  { valor: 'pagina-por-pagina', etiqueta: 'Página por página' },
  { valor: 'documento-completo', etiqueta: 'Documento completo' },
  { valor: 'solo-frentes', etiqueta: 'Solo frentes' },
  { valor: 'solo-vueltos', etiqueta: 'Solo vueltos' },
];

export const TEXTO_EJEMPLO = `NÚMERO 25. COMPRAVENTA. En la ciudad de San Salvador, a las 10:30 del día 15/03/2024. Ante mí, MARÍA ELENA RIVAS LÓPEZ, Notario, de este domicilio, comparecen: el señor JUAN CARLOS PÉREZ MARTÍNEZ, de 45 años de edad, Comerciante, del domicilio de Santa Tecla, departamento de La Libertad, a quien conozco e identifico por medio de su Documento Único de Identidad número 01234567-8, con Número de Identificación Tributaria 0614-010190-101-1, a quien en el transcurso de este instrumento se denominará "EL VENDEDOR"; y la señora ANA SOFÍA GÓMEZ DE CASTRO, de 38 años de edad, Abogada, del domicilio de San Salvador, quien se identifica con su pasaporte número A1234567, a quien se denominará "LA COMPRADORA", y ME DICEN:
I) Que EL VENDEDOR es dueño y actual poseedor de un inmueble de naturaleza urbana, situado en la Colonia Escalón, de una extensión superficial de 350.75 metros cuadrados, inscrito bajo la matrícula 60012345-00000 del Registro de la Propiedad Raíz e Hipotecas de la Primera Sección del Centro.
II) Que por el precio de $125,500.50 que EL VENDEDOR declara haber recibido a su entera satisfacción, le vende a LA COMPRADORA el inmueble antes descrito.
III) Que el saldo de 25,000 dólares será pagado en un plazo de 12 meses con una tasa de interés del 1.5% mensual.
Yo, el suscrito Notario, DOY FE: que expliqué a los comparecientes los efectos legales de este instrumento; y leído que les hube íntegramente todo lo escrito, en un solo acto sin interrupción, ratifican su contenido y firmamos.
Paso ante mí: DOY FE.`;
