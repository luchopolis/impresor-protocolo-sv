import type { TipoCara } from './types.js';

/** Parámetros de la Sección de Notariado (CSJ, El Salvador). Medidas en centímetros. */
export const PAPEL = { anchoCm: 21.0, altoCm: 28.0 } as const;

export const LINEAS_POR_CARA = 24;
export const INTERLINEADO_PT = 24;

export const MARGENES: Record<TipoCara, { sup: number; inf: number; izq: number; der: number }> = {
  frente: { sup: 4.46, inf: 2.46, izq: 3.0, der: 1.1 },
  vuelto: { sup: 2.8, inf: 4.46, izq: 1.3, der: 3.1 },
};

const PT_POR_CM = 72 / 2.54;

/** Ancho útil de la caja de texto en puntos tipográficos. */
export function anchoUtilPt(cara: TipoCara): number {
  const m = MARGENES[cara];
  return (PAPEL.anchoCm - m.izq - m.der) * PT_POR_CM;
}

export const FUENTES_SOPORTADAS = ['Arial', 'Times New Roman', 'Courier New'] as const;
export const TAMANOS_SOPORTADOS = ['10pt', '10.5pt', '11pt', '11.5pt', '12pt', '13pt', '14pt'] as const;
