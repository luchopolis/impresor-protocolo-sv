import type { OpcionesTestimonio } from '../types.js';
import { MESES, enteroALetras } from './numeroALetras.js';

/**
 * Fecha de expedición en el estilo de la razón: "diecinueve días del mes de octubre de dos mil
 * veintiséis". Se antepone "a los" (o "al" para el día primero).
 */
export function fechaExpedicionALetras(iso: string, enLetras = true): string {
  const [a, m, d] = iso.split('-').map(Number);
  const anio = enLetras ? enteroALetras(a) : String(a);
  if (d === 1) return `al primer día del mes de ${MESES[m - 1]} de ${anio}`;
  const dia = enLetras ? enteroALetras(d) : String(d);
  return `a los ${dia} días del mes de ${MESES[m - 1]} de ${anio}`;
}

interface DatosRazon extends OpcionesTestimonio {
  /** Escribir folios, número de libro y fecha en letras (regla notarial). */
  enLetras: boolean;
}

/** Párrafo legal estándar que cierra todo testimonio. */
export function razonDeTestimonio(d: DatosRazon): string {
  const n = (x: number) => (d.enLetras ? enteroALetras(x) : String(x));
  const ciudad = d.ciudad?.trim() || 'San Salvador';
  return (
    `PASÓ ANTE MÍ: Al Folio ${n(d.folioInicial)} al Folio ${n(d.folioFinal)} de mi Protocolo Número ${n(d.libroNumero)}, ` +
    `que vence el presente año; y para seguridad de ${d.nombreCliente.trim()}, expido este ${d.numeroTestimonio} ` +
    `TESTIMONIO, en la ciudad de ${ciudad}, ${fechaExpedicionALetras(d.fechaExpedicion, d.enLetras)}, ` +
    `el cual sello y firmo en hojas de papel bond útiles.`
  );
}
