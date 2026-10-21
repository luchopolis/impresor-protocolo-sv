import { INTERLINEADO_PT, LINEAS_POR_CARA, PAPEL } from '../constantes';
import { Icono, type NombreIcono } from './Icono';

export type Seccion = 'inicio';

interface ItemMenu {
  id: Seccion | null;
  etiqueta: string;
  icono: NombreIcono;
}

const PRINCIPAL: ItemMenu[] = [{ id: 'inicio', etiqueta: 'Inicio', icono: 'inicio' }];
const PROXIMAMENTE: ItemMenu[] = [
  { id: null, etiqueta: 'Plantillas', icono: 'plantillas' },
  { id: null, etiqueta: 'Libros y folios', icono: 'libro' },
];

interface Props {
  activa: Seccion;
  onNavegar: (s: Seccion) => void;
  abierto: boolean;
  onCerrar: () => void;
}

export function MenuLateral({ activa, onNavegar, abierto, onCerrar }: Props) {
  return (
    <>
      <div className={`menu-velo no-print${abierto ? ' menu-velo--visible' : ''}`} onClick={onCerrar} aria-hidden />
      <nav className={`menu-lateral no-print${abierto ? ' menu-lateral--abierto' : ''}`} aria-label="Menú principal">
        <div className="menu-lateral__marca">
          <span className="sello" aria-hidden>
            P
          </span>
          <span>
            <strong>Protocolab</strong>
            <small>Protocolo notarial · SV</small>
          </span>
        </div>

        <p className="menu-lateral__grupo">Principal</p>
        <ul>
          {PRINCIPAL.map((it) => (
            <li key={it.etiqueta}>
              <button
                type="button"
                className={`menu-item${activa === it.id ? ' menu-item--activo' : ''}`}
                aria-current={activa === it.id ? 'page' : undefined}
                onClick={() => {
                  if (it.id) onNavegar(it.id);
                  onCerrar();
                }}
              >
                <Icono nombre={it.icono} />
                {it.etiqueta}
              </button>
            </li>
          ))}
        </ul>

        <p className="menu-lateral__grupo">Próximamente</p>
        <ul>
          {PROXIMAMENTE.map((it) => (
            <li key={it.etiqueta}>
              <button type="button" className="menu-item" disabled>
                <Icono nombre={it.icono} />
                {it.etiqueta}
                <span className="pastilla">Pronto</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="menu-lateral__ficha">
          <p>Normativa CSJ</p>
          <dl>
            <div>
              <dt>Papel</dt>
              <dd>
                {PAPEL.anchoCm} × {PAPEL.altoCm} cm
              </dd>
            </div>
            <div>
              <dt>Renglones</dt>
              <dd>{LINEAS_POR_CARA} por cara</dd>
            </div>
            <div>
              <dt>Interlineado</dt>
              <dd>Exacto {INTERLINEADO_PT} pt</dd>
            </div>
          </dl>
        </div>
      </nav>
    </>
  );
}
