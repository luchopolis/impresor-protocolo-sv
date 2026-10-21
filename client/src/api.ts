import type { ErrorResponse, FormatProtocolRequest, FormatProtocolResponse } from './types';

export async function formatearProtocolo(peticion: FormatProtocolRequest): Promise<FormatProtocolResponse> {
  const res = await fetch('/api/format-protocol', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(peticion),
  });
  const datos = (await res.json().catch(() => null)) as FormatProtocolResponse | ErrorResponse | null;
  if (!res.ok || !datos || 'error' in datos) {
    const e = datos && 'error' in datos ? datos : null;
    throw new Error([e?.error ?? `Error ${res.status}`, ...(e?.detalles ?? [])].join('\n'));
  }
  return datos;
}
