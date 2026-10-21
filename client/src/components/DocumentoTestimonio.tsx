import { useLayoutEffect, useState, type CSSProperties } from 'react';
import { MARGEN_TESTIMONIO_CM, PAPELES_TESTIMONIO, familiaCss } from '../constantes';
import type { TestimonioResultado } from '../types';

interface Fragmento {
  texto: string;
  /** El párrafo continúa en la página siguiente: su último renglón se justifica completo. */
  cortado: boolean;
}

interface Formato {
  anchoCm: number;
  altoCm: number;
  fuente: string;
  tamano: string;
  interlineado: number;
}

/**
 * Reparte los párrafos en páginas midiendo el texto real en el navegador. Así la vista previa y la
 * impresión son idénticas: se imprime exactamente lo que se ve, página por página.
 */
function paginar(parrafos: string[], f: Formato): Fragmento[][] {
  const medidor = document.createElement('div');
  Object.assign(medidor.style, {
    position: 'absolute',
    left: '-10000px',
    top: '0',
    visibility: 'hidden',
    width: `${f.anchoCm - 2 * MARGEN_TESTIMONIO_CM}cm`,
    fontFamily: f.fuente,
    fontSize: f.tamano,
    lineHeight: String(f.interlineado),
    textAlign: 'justify',
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(medidor);

  const regla = document.createElement('div');
  regla.style.height = `${f.altoCm - 2 * MARGEN_TESTIMONIO_CM}cm`;
  medidor.appendChild(regla);
  const altoUtil = regla.getBoundingClientRect().height;
  regla.remove();

  const cabe = () => medidor.getBoundingClientRect().height <= altoUtil + 0.5;
  const paginas: Fragmento[][] = [];
  let actual: Fragmento[] = [];
  const cerrarPagina = () => {
    paginas.push(actual);
    actual = [];
    medidor.replaceChildren();
  };

  for (const parrafo of parrafos) {
    const palabras = parrafo.split(' ').filter(Boolean);
    let inicio = 0;
    while (inicio < palabras.length) {
      const p = document.createElement('p');
      p.style.margin = '0';
      p.textContent = palabras.slice(inicio).join(' ');
      medidor.appendChild(p);
      if (cabe()) {
        actual.push({ texto: p.textContent, cortado: false });
        break;
      }
      // Máximo de palabras que caben: el corte cae siempre al final de un renglón lleno.
      let lo = 0;
      let hi = palabras.length - inicio - 1;
      while (lo < hi) {
        const medio = Math.ceil((lo + hi) / 2);
        p.textContent = palabras.slice(inicio, inicio + medio).join(' ');
        if (cabe()) lo = medio;
        else hi = medio - 1;
      }
      if (lo === 0 && actual.length > 0) {
        p.remove();
        cerrarPagina();
        continue;
      }
      const k = Math.max(lo, 1);
      actual.push({ texto: palabras.slice(inicio, inicio + k).join(' '), cortado: true });
      inicio += k;
      cerrarPagina();
    }
  }
  if (actual.length) paginas.push(actual);
  medidor.remove();
  return paginas;
}

interface Props {
  testimonio: TestimonioResultado;
  tipoFuente: string;
  tamanoFuente: string;
  onPaginas?: (n: number) => void;
}

export function DocumentoTestimonio({ testimonio, tipoFuente, tamanoFuente, onPaginas }: Props) {
  const [paginas, setPaginas] = useState<Fragmento[][]>([]);
  const papel = PAPELES_TESTIMONIO[testimonio.tamanoPapel];
  const fuente = familiaCss(tipoFuente);

  useLayoutEffect(() => {
    let vigente = true;
    const calcular = () => {
      if (!vigente) return;
      const p = paginar(testimonio.parrafos, {
        anchoCm: papel.anchoCm,
        altoCm: papel.altoCm,
        fuente,
        tamano: tamanoFuente,
        interlineado: testimonio.interlineado,
      });
      setPaginas(p);
      onPaginas?.(p.length);
    };
    calcular();
    // Si la fuente aún no estaba cargada, se vuelve a paginar con las métricas definitivas.
    document.fonts?.ready.then(calcular);
    return () => {
      vigente = false;
    };
    // onPaginas es una notificación; no debe disparar una nueva paginación.
  }, [testimonio, papel, fuente, tamanoFuente]);

  const estilo = {
    '--alto': `${papel.altoCm}cm`,
    width: `${papel.anchoCm}cm`,
    height: `${papel.altoCm}cm`,
    padding: `${MARGEN_TESTIMONIO_CM}cm`,
    fontFamily: fuente,
    fontSize: tamanoFuente,
    lineHeight: testimonio.interlineado,
  } as CSSProperties;

  return (
    <>
      {paginas.map((fragmentos, i) => (
        <section className="hoja-wrap" key={i}>
          <header className="hoja__etiqueta">
            Página {i + 1} de {paginas.length}
            <span className="hoja__id">
              {papel.etiqueta} · {papel.anchoCm} × {papel.altoCm} cm
            </span>
          </header>
          <article className="pagina-testimonio" style={estilo} aria-label={`Página ${i + 1}`}>
            {fragmentos.map((f, j) => (
              <p key={j} className={f.cortado ? 'cortado' : undefined}>
                {f.texto}
              </p>
            ))}
          </article>
        </section>
      ))}
    </>
  );
}
