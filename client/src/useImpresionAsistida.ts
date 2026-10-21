import { useCallback, useState } from 'react';
import { flushSync } from 'react-dom';
import type { ProtocolPage } from './types';

/**
 * Lanza window.print() y resuelve al terminar. En Chrome/Edge/Firefox print() bloquea hasta cerrar
 * el diálogo; "afterprint" cubre los navegadores donde no bloquea.
 */
function imprimirYEsperar(): Promise<void> {
  return new Promise((resolve) => {
    let hecho = false;
    const fin = () => {
      if (hecho) return;
      hecho = true;
      window.removeEventListener('afterprint', fin);
      resolve();
    };
    window.addEventListener('afterprint', fin);
    window.print();
    setTimeout(fin, 400);
  });
}

/**
 * Cola de impresión cara por cara: muestra un aviso por cada cara y solo imprime la cara aprobada,
 * ocultando el resto mediante una regla @media print dinámica (ver `cssDinamico`).
 */
export function useImpresionAsistida() {
  const [cola, setCola] = useState<ProtocolPage[]>([]);
  const [indice, setIndice] = useState(0);
  const [objetivo, setObjetivo] = useState<number | null>(null);
  const [imprimiendo, setImprimiendo] = useState(false);

  const terminar = useCallback(() => {
    setCola([]);
    setIndice(0);
    setObjetivo(null);
    setImprimiendo(false);
  }, []);

  const iniciar = useCallback((paginas: ProtocolPage[]) => {
    if (!paginas.length) return;
    setCola(paginas);
    setIndice(0);
  }, []);

  const avanzar = useCallback(() => {
    if (indice + 1 >= cola.length) terminar();
    else setIndice(indice + 1);
  }, [indice, cola.length, terminar]);

  const continuar = useCallback(async () => {
    const page = cola[indice];
    if (!page || imprimiendo) return;
    // La regla de impresión debe estar en el DOM antes de que el navegador tome la instantánea.
    flushSync(() => {
      setObjetivo(page.id);
      setImprimiendo(true);
    });
    await imprimirYEsperar();
    setImprimiendo(false);
    avanzar();
  }, [cola, indice, imprimiendo, avanzar]);

  const cssDinamico =
    objetivo === null
      ? ''
      : `@media print {
          .hoja-wrap:not([data-page-id="${objetivo}"]) { display: none !important; }
          .hoja-wrap[data-page-id="${objetivo}"] { break-before: auto !important; break-after: auto !important; }
        }`;

  return {
    activa: cola.length > 0 && !imprimiendo,
    pagina: cola[indice] as ProtocolPage | undefined,
    posicion: indice + 1,
    total: cola.length,
    cssDinamico,
    iniciar,
    continuar,
    omitir: avanzar,
    cancelar: terminar,
  };
}
