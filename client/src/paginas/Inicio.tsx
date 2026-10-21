import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { formatearProtocolo } from '../api';
import { DocumentoTestimonio } from '../components/DocumentoTestimonio';
import { HojaProtocolo } from '../components/HojaProtocolo';
import { Icono } from '../components/Icono';
import { ModalImpresion } from '../components/ModalImpresion';
import { PanelAjustes, type Ajustes } from '../components/PanelAjustes';
import { MOSTRAR_TESTIMONIO, PAPEL, PAPELES_TESTIMONIO } from '../constantes';
import type { FormatProtocolRequest, FormatProtocolResponse } from '../types';
import { useImpresionAsistida } from '../useImpresionAsistida';

/** Fecha local de hoy en formato AAAA-MM-DD. */
function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const AJUSTES_INICIALES: Ajustes = {
  tipoDocumento: 'protocolo',
  testimonio: {
    tamanoPapel: 'carta',
    interlineado: 1.5,
    libroNumero: 1,
    folioInicial: 1,
    folioFinal: 1,
    nombreCliente: '',
    numeroTestimonio: 'PRIMER',
    fechaExpedicion: hoy(),
    ciudad: 'San Salvador',
  },
  texto: '',
  lineaInicio: 1,
  tamanoFuente: '12pt',
  tipoFuente: 'Arial',
  ladoInicial: 'frente',
  modoSalida: 'vista-previa',
  folioInicial: 1,
  lineasFirma: 4,
  convertirNumeros: true,
  rellenarGuiones: true,
};

interface Calibracion {
  xMm: number;
  yMm: number;
  imprimirGuias: boolean;
}

const CLAVE_ALMACEN = 'protocolab:preferencias';

function leerPreferencias(): { ajustes?: Partial<Ajustes>; calibracion?: Partial<Calibracion> } {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_ALMACEN) ?? '{}');
  } catch {
    return {};
  }
}

const ETIQUETA_IMPRIMIR: Record<Ajustes['modoSalida'], string> = {
  'vista-previa': 'Imprimir',
  'pagina-por-pagina': 'Imprimir esta cara',
  'documento-completo': 'Imprimir documento',
  'solo-frentes': 'Imprimir frentes',
  'solo-vueltos': 'Imprimir vueltos',
};

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 1.25;

export function Inicio() {
  const prefs = useMemo(leerPreferencias, []);
  const [ajustes, setAjustes] = useState<Ajustes>(() => ({
    ...AJUSTES_INICIALES,
    ...prefs.ajustes,
    ...(MOSTRAR_TESTIMONIO ? {} : { tipoDocumento: 'protocolo' as const }),
    // Los folios se numeran desde 1 dentro del instrumento (no hay campo para cambiarlo).
    folioInicial: 1,
    // La fecha de expedición siempre arranca en el día de hoy.
    testimonio: { ...AJUSTES_INICIALES.testimonio, ...prefs.ajustes?.testimonio, fechaExpedicion: hoy() },
  }));
  const [calibracion, setCalibracion] = useState<Calibracion>({
    xMm: 0,
    yMm: 0,
    imprimirGuias: false,
    ...prefs.calibracion,
  });
  const [resultado, setResultado] = useState<FormatProtocolResponse | null>(null);
  /** Ajustes con los que se generó `resultado` (la vista no cambia hasta volver a procesar). */
  const [ajustesResultado, setAjustesResultado] = useState<Ajustes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [zoom, setZoom] = useState(0.75);
  const [vistaImpresion, setVistaImpresion] = useState(false);
  const [actual, setActual] = useState(0);
  const [paginasTestimonio, setPaginasTestimonio] = useState(0);
  const impresion = useImpresionAsistida();

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_ALMACEN, JSON.stringify({ ajustes, calibracion }));
    } catch {
      /* almacenamiento no disponible: las preferencias simplemente no se recuerdan */
    }
  }, [ajustes, calibracion]);

  const procesar = async () => {
    setProcesando(true);
    setError(null);
    try {
      const { testimonio, ...comunes } = ajustes;
      const peticion: FormatProtocolRequest =
        ajustes.tipoDocumento === 'testimonio' ? { ...comunes, testimonio } : comunes;
      const r = await formatearProtocolo(peticion);
      setResultado(r);
      setAjustesResultado(ajustes);
      setActual(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setProcesando(false);
    }
  };

  const testimonio = resultado?.tipoDocumento === 'testimonio' ? resultado.testimonio : undefined;
  const papel = testimonio ? PAPELES_TESTIMONIO[testimonio.tamanoPapel] : PAPEL;
  const pages = resultado?.pages ?? [];
  const paginaPorPagina = ajustesResultado?.modoSalida === 'pagina-por-pagina';
  const visibles = paginaPorPagina ? pages.slice(actual, actual + 1) : pages;
  const cambiarZoom = (delta: number) =>
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + delta) * 100) / 100)));

  const estilo = {
    '--cal-x': `${calibracion.xMm}mm`,
    '--cal-y': `${calibracion.yMm}mm`,
  } as CSSProperties;

  return (
    <div
      className={`inicio${calibracion.imprimirGuias ? ' imprimir-guias' : ''}${vistaImpresion ? ' vista-impresion' : ''}`}
      style={estilo}
    >
      <style>{impresion.cssDinamico}</style>
      <style>{`@page { size: ${papel.anchoCm}cm ${papel.altoCm}cm; margin: 0; }`}</style>

      <PanelAjustes
        ajustes={ajustes}
        onCambio={(p) => setAjustes((a) => ({ ...a, ...p }))}
        onProcesar={procesar}
        procesando={procesando}
      />

      <section className="area" aria-label="Vista previa del protocolo">
        <div className="barra no-print">
          <div className="barra__datos">
            {testimonio ? (
              <>
                <span className="dato">
                  <strong>{paginasTestimonio}</strong> página{paginasTestimonio === 1 ? '' : 's'}
                </span>
                <span className="dato">
                  Folios <strong>{testimonio.folioInicial}</strong>–<strong>{testimonio.folioFinal}</strong>
                </span>
                <span className="dato dato--tenue">{PAPELES_TESTIMONIO[testimonio.tamanoPapel].etiqueta}</span>
              </>
            ) : resultado ? (
              <>
                <span className="dato">
                  <strong>{resultado.meta.totalCaras}</strong> caras
                </span>
                <span className="dato">
                  <strong>{resultado.meta.totalFolios}</strong> folio{resultado.meta.totalFolios === 1 ? '' : 's'}
                </span>
                {pages.length !== resultado.meta.totalCaras && (
                  <span className="dato dato--tenue">mostrando {pages.length}</span>
                )}
              </>
            ) : (
              <span className="dato dato--tenue">Sin documento</span>
            )}
          </div>

          {!testimonio && (
          <div className="segmentado segmentado--barra" role="radiogroup" aria-label="Modo de vista">
            <button
              type="button"
              role="radio"
              aria-checked={!vistaImpresion}
              className={!vistaImpresion ? 'activo' : ''}
              onClick={() => setVistaImpresion(false)}
            >
              <Icono nombre="lapiz" tamano={15} /> Edición
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={vistaImpresion}
              className={vistaImpresion ? 'activo' : ''}
              onClick={() => setVistaImpresion(true)}
            >
              <Icono nombre="ojo" tamano={15} /> Impresión
            </button>
          </div>
          )}

          <div className="grupo-zoom" aria-label="Zoom">
            <button type="button" className="icono-btn" onClick={() => cambiarZoom(-0.1)} disabled={zoom <= ZOOM_MIN} aria-label="Alejar">
              <Icono nombre="menos" tamano={16} />
            </button>
            <button type="button" className="grupo-zoom__valor" onClick={() => setZoom(0.75)} title="Restablecer">
              {Math.round(zoom * 100)}%
            </button>
            <button type="button" className="icono-btn" onClick={() => cambiarZoom(0.1)} disabled={zoom >= ZOOM_MAX} aria-label="Acercar">
              <Icono nombre="mas" tamano={16} />
            </button>
          </div>

          {!testimonio && (
          <details className="calibracion">
            <summary className="icono-btn" title="Calibración de la impresora" aria-label="Calibración de la impresora">
              <Icono nombre="ajustes" tamano={16} />
            </summary>
            <div className="calibracion__panel">
              <p className="calibracion__titulo">Desplazamiento de la impresora</p>
              <div className="rejilla">
                <label className="campo">
                  <span>Horizontal (mm)</span>
                  <input
                    type="number"
                    step={0.5}
                    value={calibracion.xMm}
                    onChange={(e) => setCalibracion((c) => ({ ...c, xMm: +e.target.value }))}
                  />
                </label>
                <label className="campo">
                  <span>Vertical (mm)</span>
                  <input
                    type="number"
                    step={0.5}
                    value={calibracion.yMm}
                    onChange={(e) => setCalibracion((c) => ({ ...c, yMm: +e.target.value }))}
                  />
                </label>
              </div>
              <label className="interruptor">
                <input
                  type="checkbox"
                  role="switch"
                  checked={calibracion.imprimirGuias}
                  onChange={(e) => setCalibracion((c) => ({ ...c, imprimirGuias: e.target.checked }))}
                />
                <span className="interruptor__pista" aria-hidden />
                Imprimir renglones guía (prueba en papel bond)
              </label>
            </div>
          </details>
          )}

          {testimonio ? (
            // Papel bond estándar: se imprime todo de una vez, sin pausas por cara.
            <button type="button" className="btn btn--primario" disabled={!paginasTestimonio} onClick={() => window.print()}>
              <Icono nombre="imprimir" tamano={17} />
              Imprimir testimonio
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primario"
              disabled={!visibles.length}
              onClick={() => impresion.iniciar(visibles)}
            >
              <Icono nombre="imprimir" tamano={17} />
              {ETIQUETA_IMPRIMIR[ajustesResultado?.modoSalida ?? 'vista-previa']}
            </button>
          )}
        </div>

        <div className="mesa">
          <div className="avisos no-print">
            {error && (
              <div className="aviso aviso--error" role="alert">
                <Icono nombre="alerta" />
                <pre>{error}</pre>
              </div>
            )}
            {resultado?.meta.advertencias.map((a) => (
              <div className="aviso" key={a}>
                <Icono nombre="alerta" />
                <p>{a}</p>
              </div>
            ))}
            {testimonio && (
              <div className="aviso aviso--info">
                <Icono nombre="documento" />
                <p>
                  Testimonio en papel {PAPELES_TESTIMONIO[testimonio.tamanoPapel].etiqueta.toLowerCase()} con la Razón de
                  Testimonio al final (folios {testimonio.folioInicial} al {testimonio.folioFinal}). Se imprime tal como se
                  ve.
                </p>
              </div>
            )}
            {!testimonio && vistaImpresion && visibles.length > 0 && (
              <div className="aviso aviso--info">
                <Icono nombre="ojo" />
                <p>
                  Así saldrá cada cara de la impresora, con la calibración aplicada
                  {calibracion.imprimirGuias ? ' e incluyendo los renglones guía' : ''}. Los renglones grises simulan los
                  del papel de protocolo y los números de la izquierda sirven de referencia: ninguno de los dos se
                  imprime ni se mueve con la calibración.
                </p>
              </div>
            )}
            {resultado && (
              <details className="texto-procesado">
                <summary>Revisar texto procesado (cifras convertidas a letras)</summary>
                <p>{resultado.meta.textoProcesado}</p>
              </details>
            )}
          </div>

          {paginaPorPagina && pages.length > 0 && (
            <div className="paginador no-print">
              <button type="button" className="icono-btn" disabled={actual === 0} onClick={() => setActual(actual - 1)} aria-label="Cara anterior">
                <Icono nombre="izquierda" />
              </button>
              <span>
                Cara {actual + 1} de {pages.length}
              </span>
              <button
                type="button"
                className="icono-btn"
                disabled={actual >= pages.length - 1}
                onClick={() => setActual(actual + 1)}
                aria-label="Cara siguiente"
              >
                <Icono nombre="derecha" />
              </button>
            </div>
          )}

          {testimonio && ajustesResultado ? (
            <div className="hojas" style={{ zoom }}>
              <DocumentoTestimonio
                testimonio={testimonio}
                tipoFuente={ajustesResultado.tipoFuente}
                tamanoFuente={ajustesResultado.tamanoFuente}
                onPaginas={setPaginasTestimonio}
              />
            </div>
          ) : visibles.length === 0 ? (
            <div className="vacio no-print">
              <svg className="vacio__ilustracion" viewBox="0 0 120 150" aria-hidden>
                <rect x="10" y="6" width="100" height="138" rx="4" />
                {Array.from({ length: 9 }, (_, i) => (
                  <line key={i} x1="28" x2={i === 8 ? 70 : 96} y1={40 + i * 10} y2={40 + i * 10} />
                ))}
              </svg>
              <h3>Su {ajustes.tipoDocumento === 'testimonio' ? 'testimonio' : 'protocolo'} aparecerá aquí</h3>
              <ol>
                <li>Elija el tipo de documento y pegue el texto o abra un archivo .txt</li>
                <li>Ajuste formato y ubicación en el libro</li>
                <li>
                  {ajustes.tipoDocumento === 'testimonio'
                    ? 'Complete la razón, genere el testimonio e imprímalo en papel bond'
                    : 'Presione «Procesar y Formatear» e imprima cara por cara'}
                </li>
              </ol>
            </div>
          ) : (
            <div className="hojas" style={{ zoom }}>
              {visibles.map((p) => (
                <HojaProtocolo
                  key={p.id}
                  page={p}
                  tipoFuente={ajustesResultado!.tipoFuente}
                  tamanoFuente={ajustesResultado!.tamanoFuente}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {impresion.activa && impresion.pagina && (
        <ModalImpresion
          page={impresion.pagina}
          posicion={impresion.posicion}
          total={impresion.total}
          onContinuar={impresion.continuar}
          onOmitir={impresion.omitir}
          onCancelar={impresion.cancelar}
        />
      )}
    </div>
  );
}
