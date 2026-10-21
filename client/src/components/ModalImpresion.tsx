import { useEffect, useRef } from 'react';
import type { ProtocolPage } from '../types';

interface Props {
  page: ProtocolPage;
  posicion: number;
  total: number;
  onContinuar: () => void;
  onOmitir: () => void;
  onCancelar: () => void;
}

export function ModalImpresion({ page, posicion, total, onContinuar, onOmitir, onCancelar }: Props) {
  const continuarRef = useRef<HTMLButtonElement>(null);
  useEffect(() => continuarRef.current?.focus(), [page.id]);

  const lado = page.type === 'frente' ? 'FRENTE' : 'VUELTO';

  return (
    <div className="modal no-print" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div className="modal__caja">
        <p className="modal__paso">
          Cara {posicion} de {total}
        </p>
        <h2 id="modal-titulo" className={`modal__titulo modal__titulo--${page.type}`}>
          Introduzca la hoja del lado {lado} para el Folio {page.folioNum} en la impresora y presione Continuar.
        </h2>
        <ul className="modal__ayuda">
          <li>
            {page.type === 'frente'
              ? 'Coloque el folio con el frente hacia el lado de impresión de su bandeja.'
              : 'Voltee el MISMO folio que acaba de imprimir: el vuelto va al reverso de la hoja.'}
          </li>
          <li>En el diálogo de impresión: tamaño 21 × 28 cm, escala 100 %, márgenes "Ninguno", sin encabezados ni pies.</li>
        </ul>
        <div className="modal__acciones">
          <button type="button" className="btn btn--fantasma" onClick={onCancelar}>
            Cancelar impresión
          </button>
          <button type="button" className="btn btn--secundario" onClick={onOmitir}>
            Omitir esta cara
          </button>
          <button type="button" ref={continuarRef} className="btn btn--primario" onClick={onContinuar}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
