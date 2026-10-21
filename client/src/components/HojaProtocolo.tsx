import type { CSSProperties } from 'react';
import { MARGENES, familiaCss } from '../constantes';
import type { ProtocolPage } from '../types';

const NBSP = String.fromCharCode(0xa0);

interface Props {
  page: ProtocolPage;
  tipoFuente: string;
  tamanoFuente: string;
}

/**
 * Una cara del Libro de Protocolo a escala real (21 × 28 cm). Los márgenes se aplican como
 * relleno de la hoja, de modo que la caja de texto queda en la misma posición en pantalla y papel.
 */
export function HojaProtocolo({ page, tipoFuente, tamanoFuente }: Props) {
  const m = MARGENES[page.type];
  const lineas = page.content.split('\n');
  const finDeParrafo = new Set(page.finDeParrafo);

  const estilo = {
    '--m-sup': `${m.sup}cm`,
    '--m-inf': `${m.inf}cm`,
    '--m-izq': `${m.izq}cm`,
    '--m-der': `${m.der}cm`,
    fontFamily: familiaCss(tipoFuente),
    fontSize: tamanoFuente,
  } as CSSProperties;

  return (
    <section className="hoja-wrap" data-page-id={page.id}>
      <header className="hoja__etiqueta">
        Folio {page.folioNum} · <strong>{page.type === 'frente' ? 'FRENTE' : 'VUELTO'}</strong>
        <span className="hoja__id">cara #{page.id}</span>
      </header>
      <article className={`hoja hoja--${page.type}`} style={estilo} aria-label={`Folio ${page.folioNum} ${page.type}`}>
        <div className="hoja__numeros" aria-hidden>
          {lineas.map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <div className="hoja__caja">
          {lineas.map((linea, i) => {
            // Un cierre de párrafo sin guiones no se estira hasta el margen derecho.
            const sinJustificar = finDeParrafo.has(i) && !/-$/.test(linea);
            return (
              <div key={i} className={`renglon${sinJustificar ? ' renglon--fin' : ''}`}>
                {linea || NBSP}
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
