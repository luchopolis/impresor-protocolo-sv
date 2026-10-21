import { useRef, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { FUENTES, LINEAS_POR_CARA, MOSTRAR_TESTIMONIO, MODOS, PAPELES_TESTIMONIO, TAMANOS, TEXTO_EJEMPLO } from '../constantes';
import { NUMEROS_TESTIMONIO, type FormatProtocolRequest, type OpcionesTestimonio, type TipoDocumento } from '../types';
import { Icono, type NombreIcono } from './Icono';

export type Ajustes = Required<Omit<FormatProtocolRequest, 'testimonio'>> & {
  testimonio: Required<OpcionesTestimonio>;
};

interface Props {
  ajustes: Ajustes;
  onCambio: (parcial: Partial<Ajustes>) => void;
  onProcesar: () => void;
  procesando: boolean;
}

const TIPOS: { valor: TipoDocumento; titulo: string; detalle: string; icono: NombreIcono }[] = [
  { valor: 'protocolo', titulo: 'Protocolo', detalle: 'Hoja del libro · 24 renglones', icono: 'libro' },
  { valor: 'testimonio', titulo: 'Testimonio', detalle: 'Papel bond · texto corrido', icono: 'documento' },
];

function Paso({ n, titulo, children, extra }: { n: number; titulo: string; children: ReactNode; extra?: ReactNode }) {
  return (
    <section className="paso">
      <header className="paso__cabecera">
        <span className="paso__num">{n}</span>
        <h2>{titulo}</h2>
        {extra}
      </header>
      {children}
    </section>
  );
}

function Interruptor({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="interruptor">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="interruptor__pista" aria-hidden />
      {children}
    </label>
  );
}

function Segmentado<T extends string>({
  etiqueta,
  valor,
  opciones,
  onChange,
}: {
  etiqueta: string;
  valor: T;
  opciones: { valor: T; etiqueta: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="campo">
      <span>{etiqueta}</span>
      <div className="segmentado" role="radiogroup" aria-label={etiqueta}>
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={valor === o.valor}
            className={valor === o.valor ? 'activo' : ''}
            onClick={() => onChange(o.valor)}
          >
            {o.etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PanelAjustes({ ajustes, onCambio, onProcesar, procesando }: Props) {
  const archivoRef = useRef<HTMLInputElement>(null);
  const esTestimonio = ajustes.tipoDocumento === 'testimonio';
  const t = ajustes.testimonio;
  const cambiarTestimonio = (parcial: Partial<Ajustes['testimonio']>) => onCambio({ testimonio: { ...t, ...parcial } });

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    onProcesar();
  };

  const abrirArchivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) onCambio({ texto: await archivo.text() });
    e.target.value = '';
  };

  const parrafos = ajustes.texto.split('\n').filter((p) => p.trim()).length;
  const faltaCliente = esTestimonio && !t.nombreCliente.trim();
  const foliosInvalidos = esTestimonio && t.folioFinal < t.folioInicial;

  return (
    <form className="panel-ajustes no-print" onSubmit={enviar}>
      <div className="panel-ajustes__cuerpo">
        {MOSTRAR_TESTIMONIO && (
          <fieldset className="tipo-documento">
            <legend>Tipo de documento</legend>
            <div className="tipo-documento__opciones">
              {TIPOS.map((tipo) => (
                <label key={tipo.valor} className={`tarjeta-tipo${ajustes.tipoDocumento === tipo.valor ? ' tarjeta-tipo--activa' : ''}`}>
                  <input
                    type="radio"
                    name="tipoDocumento"
                    value={tipo.valor}
                    checked={ajustes.tipoDocumento === tipo.valor}
                    onChange={() => onCambio({ tipoDocumento: tipo.valor })}
                  />
                  <span className="tarjeta-tipo__icono">
                    <Icono nombre={tipo.icono} />
                  </span>
                  <span className="tarjeta-tipo__textos">
                    <strong>{tipo.titulo}</strong>
                    <small>{tipo.detalle}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <Paso
          n={1}
          titulo="Instrumento"
          extra={
            <div className="paso__acciones">
              <button type="button" className="btn btn--suave btn--chico" onClick={() => archivoRef.current?.click()}>
                <Icono nombre="subir" tamano={15} /> Abrir .txt
              </button>
              <button type="button" className="btn btn--suave btn--chico" onClick={() => onCambio({ texto: TEXTO_EJEMPLO })}>
                Ejemplo
              </button>
              <input ref={archivoRef} type="file" accept=".txt,text/plain" hidden onChange={abrirArchivo} />
            </div>
          }
        >
          <textarea
            className="editor"
            value={ajustes.texto}
            onChange={(e) => onCambio({ texto: e.target.value })}
            placeholder="Pegue aquí el texto del instrumento. Cada salto de línea inicia un párrafo; el cierre debe comenzar con «Paso ante mí»."
            aria-label="Texto legal en bruto"
            spellCheck
          />
          <p className="ayuda">
            {ajustes.texto.length.toLocaleString('es-SV')} caracteres · {parrafos} párrafo{parrafos === 1 ? '' : 's'}
          </p>
        </Paso>

        <Paso n={2} titulo="Formato">
          {esTestimonio && (
            <Segmentado
              etiqueta="Papel"
              valor={t.tamanoPapel}
              opciones={(['carta', 'oficio'] as const).map((p) => ({
                valor: p,
                etiqueta: `${PAPELES_TESTIMONIO[p].etiqueta} · ${PAPELES_TESTIMONIO[p].altoCm} cm`,
              }))}
              onChange={(tamanoPapel) => cambiarTestimonio({ tamanoPapel })}
            />
          )}
          <div className="rejilla">
            <label className="campo">
              <span>Fuente</span>
              <select value={ajustes.tipoFuente} onChange={(e) => onCambio({ tipoFuente: e.target.value })}>
                {FUENTES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="campo">
              <span>Tamaño</span>
              <select value={ajustes.tamanoFuente} onChange={(e) => onCambio({ tamanoFuente: e.target.value })}>
                {TAMANOS.map((tam) => (
                  <option key={tam} value={tam}>
                    {tam}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {esTestimonio && (
            <p className="ayuda">Márgenes de 2.5 cm por lado e interlineado 1.5; el texto fluye de corrido entre páginas.</p>
          )}
        </Paso>

        {!esTestimonio && (
          <Paso n={3} titulo="Posición en el libro">
            <Segmentado
              etiqueta="Lado inicial"
              valor={ajustes.ladoInicial}
              opciones={[
                { valor: 'frente', etiqueta: 'Frente' },
                { valor: 'vuelto', etiqueta: 'Vuelto' },
              ]}
              onChange={(ladoInicial) => onCambio({ ladoInicial })}
            />
            <label className="campo">
              <span>Línea de inicio</span>
              <input
                type="number"
                min={1}
                max={LINEAS_POR_CARA}
                value={ajustes.lineaInicio}
                onChange={(e) => onCambio({ lineaInicio: Number(e.target.value) })}
              />
            </label>
          </Paso>
        )}

        {esTestimonio ? (
          <Paso n={3} titulo="Razón de testimonio">
            <label className="campo">
              <span>Para seguridad de</span>
              <input
                type="text"
                value={t.nombreCliente}
                onChange={(e) => cambiarTestimonio({ nombreCliente: e.target.value })}
                placeholder="Nombre completo del cliente"
                aria-invalid={faltaCliente}
              />
            </label>
            <div className="rejilla">
              <label className="campo">
                <span>Del folio</span>
                <input
                  type="number"
                  min={1}
                  value={t.folioInicial}
                  onChange={(e) => cambiarTestimonio({ folioInicial: Number(e.target.value) })}
                />
              </label>
              <label className="campo">
                <span>Al folio</span>
                <input
                  type="number"
                  min={t.folioInicial}
                  value={t.folioFinal}
                  onChange={(e) => cambiarTestimonio({ folioFinal: Number(e.target.value) })}
                  aria-invalid={foliosInvalidos}
                />
              </label>
              <label className="campo">
                <span>Protocolo número</span>
                <input
                  type="number"
                  min={1}
                  value={t.libroNumero}
                  onChange={(e) => cambiarTestimonio({ libroNumero: Number(e.target.value) })}
                />
              </label>
              <label className="campo">
                <span>Testimonio</span>
                <select
                  value={t.numeroTestimonio}
                  onChange={(e) => cambiarTestimonio({ numeroTestimonio: e.target.value as Ajustes['testimonio']['numeroTestimonio'] })}
                >
                  {NUMEROS_TESTIMONIO.map((n) => (
                    <option key={n} value={n}>
                      {n} TESTIMONIO
                    </option>
                  ))}
                </select>
              </label>
              <label className="campo">
                <span>Fecha de expedición</span>
                <input
                  type="date"
                  value={t.fechaExpedicion}
                  onChange={(e) => cambiarTestimonio({ fechaExpedicion: e.target.value })}
                />
              </label>
              <label className="campo">
                <span>Ciudad</span>
                <input type="text" value={t.ciudad} onChange={(e) => cambiarTestimonio({ ciudad: e.target.value })} />
              </label>
            </div>
            <div className="interruptores">
              <Interruptor checked={ajustes.convertirNumeros} onChange={(v) => onCambio({ convertirNumeros: v })}>
                Convertir cifras a letras
              </Interruptor>
            </div>
          </Paso>
        ) : (
          <Paso n={4} titulo="Salida">
            <div className="rejilla">
              <label className="campo">
                <span>Modo</span>
                <select
                  value={ajustes.modoSalida}
                  onChange={(e) => onCambio({ modoSalida: e.target.value as Ajustes['modoSalida'] })}
                >
                  {MODOS.map((m) => (
                    <option key={m.valor} value={m.valor}>
                      {m.etiqueta}
                    </option>
                  ))}
                </select>
              </label>
              <label className="campo">
                <span>Renglones para firmas</span>
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={ajustes.lineasFirma}
                  onChange={(e) => onCambio({ lineasFirma: Number(e.target.value) })}
                />
              </label>
            </div>
            <div className="interruptores">
              <Interruptor checked={ajustes.convertirNumeros} onChange={(v) => onCambio({ convertirNumeros: v })}>
                Convertir cifras a letras
              </Interruptor>
              <Interruptor checked={ajustes.rellenarGuiones} onChange={(v) => onCambio({ rellenarGuiones: v })}>
                Rellenar con guiones
              </Interruptor>
            </div>
          </Paso>
        )}
      </div>

      <div className="panel-ajustes__pie">
        {faltaCliente && <p className="ayuda ayuda--pie">Escriba para seguridad de quién se expide el testimonio.</p>}
        {foliosInvalidos && <p className="ayuda ayuda--pie">El folio final no puede ser menor que el inicial.</p>}
        <button
          type="submit"
          className="btn btn--primario btn--bloque"
          disabled={procesando || !ajustes.texto.trim() || faltaCliente || foliosInvalidos}
        >
          <Icono nombre="varita" />
          {procesando ? 'Procesando…' : esTestimonio ? 'Generar testimonio' : 'Procesar y Formatear'}
        </button>
      </div>
    </form>
  );
}
