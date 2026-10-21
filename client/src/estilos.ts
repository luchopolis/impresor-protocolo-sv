import { INTERLINEADO_PT, LINEAS_POR_CARA, PAPEL } from './constantes';

/** Renglón guía: línea de 1px en la base de cada renglón de 24 pt. */
const cuadricula = (color: string) =>
  `repeating-linear-gradient(to bottom, transparent 0, transparent calc(${INTERLINEADO_PT}pt - 1px), ${color} calc(${INTERLINEADO_PT}pt - 1px), ${color} ${INTERLINEADO_PT}pt)`;

/** Tokens del modo oscuro: aplican por preferencia del sistema o al elegir «Oscuro». */
const TEMA_OSCURO = `
  --fondo: #0d1118;
  --superficie: #151a24;
  --superficie-2: #1a2030;
  --texto: #e6e9f0;
  --tenue: #98a2b6;
  --borde: #262d3b;
  --borde-fuerte: #343c4d;
  --acento: #7e9cf2;
  --acento-hover: #95aef5;
  --acento-suave: rgba(126, 156, 242, 0.14);
  --acento-texto: #0b1020;
  --oro: #d9b25f;
  --frente: #5fc58f;
  --frente-suave: rgba(95, 197, 143, 0.14);
  --vuelto: #eaa864;
  --vuelto-suave: rgba(234, 168, 100, 0.14);
  --mesa: #0a0d13;
  --punto: #1b2130;
  --aviso: #2d2717;
  --aviso-borde: #5e4d1c;
  --aviso-icono: #e2b84a;
  --error: #301a1a;
  --error-borde: #6b2e2a;
  --error-icono: #f08a7e;
  --menu-fondo: #090d17;
  --sombra: 0 1px 2px rgba(0, 0, 0, 0.4);
  color-scheme: dark;
`;

export const CSS = `
:root {
  --fondo: #f3f4f7;
  --superficie: #ffffff;
  --superficie-2: #f7f8fa;
  --texto: #131a2b;
  --tenue: #5e6a80;
  --borde: #e2e5eb;
  --borde-fuerte: #cdd2dc;
  --acento: #24449c;
  --acento-hover: #1c3784;
  --acento-suave: #e9eefb;
  --acento-texto: #ffffff;
  --oro: #b98a2f;
  --frente: #1e7a4c;
  --frente-suave: #e4f3ea;
  --vuelto: #a2560f;
  --vuelto-suave: #fbeedf;
  --mesa: #e6e9ef;
  --punto: #d3d8e1;
  --guia: #a9bde0;
  --aviso: #fff7e2;
  --aviso-borde: #f0d589;
  --aviso-icono: #a87908;
  --error: #fdeceb;
  --error-borde: #f0b4ae;
  --error-icono: #c23a2b;
  --menu-fondo: #0e1830;
  --menu-texto: #b7c1d6;
  --menu-tenue: #6f7c96;
  --menu-activo: rgba(255, 255, 255, 0.08);
  --sombra: 0 1px 2px rgba(16, 24, 40, 0.05), 0 1px 3px rgba(16, 24, 40, 0.06);
  --radio: 12px;
  --serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {${TEMA_OSCURO}}
}
:root[data-theme="dark"] {${TEMA_OSCURO}}

* { box-sizing: border-box; }
html, body, #root { margin: 0; height: 100%; }
body {
  background: var(--fondo);
  color: var(--texto);
  font: 14px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
button { font: inherit; color: inherit; }
:focus-visible { outline: 2px solid var(--acento); outline-offset: 2px; }

/* ================= Estructura ================= */
.shell { display: grid; grid-template-columns: 252px minmax(0, 1fr); height: 100vh; }
.principal { display: flex; flex-direction: column; min-width: 0; min-height: 0; }

/* ================= Menú lateral ================= */
.menu-lateral {
  display: flex; flex-direction: column; gap: 4px;
  padding: 20px 14px; background: var(--menu-fondo); color: var(--menu-texto); overflow-y: auto;
}
.menu-lateral ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.menu-lateral__marca { display: flex; align-items: center; gap: 12px; padding: 4px 8px 22px; }
.menu-lateral__marca strong { display: block; color: #fff; font: 600 18px/1.2 var(--serif); letter-spacing: 0.2px; }
.menu-lateral__marca small { display: block; color: var(--menu-tenue); font-size: 12px; }
.sello {
  display: grid; place-items: center; width: 38px; height: 38px; flex: none; border-radius: 10px;
  background: linear-gradient(145deg, #d9b25f, #9c7224); color: #1a1405;
  font: 700 20px/1 var(--serif); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.25);
}
.menu-lateral__grupo {
  margin: 14px 10px 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.8px;
  text-transform: uppercase; color: var(--menu-tenue);
}
.menu-item {
  position: relative; display: flex; align-items: center; gap: 12px; width: 100%;
  padding: 9px 10px; border: 0; border-radius: 8px; background: none; color: var(--menu-texto);
  font-weight: 500; text-align: left; cursor: pointer; transition: background 0.15s, color 0.15s;
}
.menu-item:hover:not(:disabled) { background: var(--menu-activo); color: #fff; }
.menu-item--activo { background: var(--menu-activo); color: #fff; }
.menu-item--activo::before {
  content: ''; position: absolute; left: -14px; top: 8px; bottom: 8px; width: 3px;
  border-radius: 0 3px 3px 0; background: var(--oro);
}
.menu-item:disabled { cursor: default; opacity: 0.55; }
.pastilla {
  margin-left: auto; padding: 1px 7px; border-radius: 99px; font-size: 10.5px; font-weight: 600;
  background: rgba(255,255,255,0.08); color: var(--menu-texto);
}
.menu-lateral__ficha {
  margin-top: auto; padding: 14px; border-radius: 10px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
}
.menu-lateral__ficha p { margin: 0 0 8px; color: #fff; font-weight: 600; font-size: 12.5px; }
.menu-lateral__ficha dl { margin: 0; display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
.menu-lateral__ficha dl div { display: flex; justify-content: space-between; gap: 8px; }
.menu-lateral__ficha dt { color: var(--menu-tenue); }
.menu-lateral__ficha dd { margin: 0; color: var(--menu-texto); }
.menu-velo { display: none; }

/* ================= Encabezado ================= */
.encabezado { display: flex; align-items: flex-start; gap: 12px; padding: 22px 28px 0; }
.encabezado h1 { margin: 0; font: 600 26px/1.2 var(--serif); letter-spacing: 0.2px; }
.encabezado p { margin: 4px 0 0; color: var(--tenue); }
.encabezado__menu { display: none !important; }
.encabezado__textos { flex: 1; min-width: 0; }
.selector-tema { flex: none; align-self: flex-start; }
.selector-tema button { flex: none; padding: 6px 12px; font-size: 13px; }

/* ================= Inicio ================= */
.inicio {
  flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(330px, 380px) minmax(0, 1fr);
  gap: 20px; padding: 20px 28px 28px;
}
.panel-ajustes, .area {
  display: flex; flex-direction: column; min-height: 0;
  background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--radio); box-shadow: var(--sombra);
}
.panel-ajustes__cuerpo { flex: 1; min-height: 0; overflow-y: auto; padding: 6px 20px; }
.panel-ajustes__pie { padding: 16px 20px; border-top: 1px solid var(--borde); }

.paso { padding: 16px 0 18px; border-bottom: 1px solid var(--borde); display: flex; flex-direction: column; gap: 12px; }
.paso:last-child { border-bottom: 0; }
.paso__cabecera { display: flex; align-items: center; gap: 10px; }
.paso__cabecera h2 { margin: 0; font-size: 14.5px; font-weight: 600; }
.paso__num {
  display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%;
  background: var(--acento-suave); color: var(--acento); font-size: 12px; font-weight: 700;
}
.paso__acciones { margin-left: auto; display: flex; gap: 6px; }

.rejilla { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.campo { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.campo > span { font-size: 12.5px; font-weight: 500; color: var(--tenue); }
.campo input, .campo select, .editor {
  width: 100%; font: inherit; color: var(--texto); background: var(--superficie-2);
  border: 1px solid var(--borde); border-radius: 8px; padding: 8px 10px; transition: border-color 0.15s, box-shadow 0.15s;
}
.campo input:hover, .campo select:hover, .editor:hover { border-color: var(--borde-fuerte); }
.campo input:focus, .campo select:focus, .editor:focus {
  outline: none; border-color: var(--acento); box-shadow: 0 0 0 3px var(--acento-suave);
}
.editor {
  min-height: 230px; resize: vertical; line-height: 1.6;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12.5px;
}
.ayuda { margin: -4px 0 0; font-size: 12px; color: var(--tenue); }

.segmentado {
  display: inline-flex; padding: 3px; gap: 2px; border-radius: 9px;
  background: var(--superficie-2); border: 1px solid var(--borde);
}
.segmentado button {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 6px 14px; border: 0; border-radius: 7px; background: none; color: var(--tenue);
  font-weight: 500; cursor: pointer; transition: background 0.15s, color 0.15s;
}
.segmentado button:hover { color: var(--texto); }
.segmentado button.activo { background: var(--superficie); color: var(--texto); box-shadow: var(--sombra); }
.paso .segmentado { display: flex; }
.segmentado--barra button { flex: none; padding: 5px 10px; font-size: 13px; }

.interruptores { display: flex; flex-direction: column; gap: 10px; }
.interruptor { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13.5px; }
.interruptor input { position: absolute; opacity: 0; pointer-events: none; }
.interruptor__pista {
  position: relative; flex: none; width: 34px; height: 20px; border-radius: 99px;
  background: var(--borde-fuerte); transition: background 0.15s;
}
.interruptor__pista::after {
  content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.25); transition: transform 0.15s;
}
.interruptor input:checked + .interruptor__pista { background: var(--acento); }
.interruptor input:checked + .interruptor__pista::after { transform: translateX(14px); }
.interruptor input:focus-visible + .interruptor__pista { outline: 2px solid var(--acento); outline-offset: 2px; }

/* ================= Botones ================= */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 8px 14px; border-radius: 8px; border: 1px solid transparent;
  font-weight: 600; cursor: pointer; white-space: nowrap; transition: background 0.15s, border-color 0.15s, opacity 0.15s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn--primario { background: var(--acento); color: var(--acento-texto); box-shadow: 0 1px 2px rgba(36,68,156,0.3); }
.btn--primario:hover:not(:disabled) { background: var(--acento-hover); }
.btn--secundario { background: var(--superficie); border-color: var(--borde-fuerte); }
.btn--suave { background: var(--superficie-2); border-color: var(--borde); color: var(--texto); font-weight: 500; }
.btn--suave:hover { border-color: var(--borde-fuerte); }
.btn--fantasma { background: transparent; color: var(--tenue); }
.btn--fantasma:hover { color: var(--texto); }
.btn--chico { padding: 4px 10px; font-size: 12.5px; gap: 5px; }
.btn--bloque { width: 100%; padding: 12px; font-size: 15px; }
.icono-btn {
  display: inline-grid; place-items: center; width: 32px; height: 32px; padding: 0;
  border: 1px solid var(--borde); border-radius: 8px; background: var(--superficie); color: var(--texto); cursor: pointer;
}
.icono-btn:hover:not(:disabled) { border-color: var(--borde-fuerte); }
.icono-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ================= Área de trabajo ================= */
.area { overflow: hidden; }
.barra {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px;
  padding: 12px 14px; border-bottom: 1px solid var(--borde);
}
.barra__datos { display: flex; flex-wrap: wrap; gap: 6px; margin-right: auto; }
.dato {
  padding: 4px 10px; border-radius: 99px; background: var(--acento-suave); color: var(--acento); font-size: 12.5px;
}
.dato strong { font-weight: 700; }
.dato--tenue { background: var(--superficie-2); color: var(--tenue); }
.grupo-zoom { display: inline-flex; align-items: center; gap: 4px; }
.grupo-zoom__valor {
  min-width: 46px; padding: 6px 2px; border: 0; background: none; color: var(--tenue);
  font-variant-numeric: tabular-nums; font-size: 13px; cursor: pointer;
}
.calibracion { position: relative; }
.calibracion summary { list-style: none; }
.calibracion summary::-webkit-details-marker { display: none; }
.calibracion summary { cursor: pointer; }
.calibracion[open] summary { border-color: var(--acento); color: var(--acento); background: var(--acento-suave); }
.calibracion__panel {
  position: absolute; right: 0; top: calc(100% + 8px); z-index: 20; width: 300px;
  display: flex; flex-direction: column; gap: 14px; padding: 16px;
  background: var(--superficie); border: 1px solid var(--borde); border-radius: var(--radio);
  box-shadow: 0 12px 32px rgba(16, 24, 40, 0.18);
}
.calibracion__titulo { margin: 0; font-weight: 600; }

.mesa {
  flex: 1; min-height: 0; overflow: auto;
  background-color: var(--mesa);
  background-image: radial-gradient(var(--punto) 1px, transparent 1px);
  background-size: 18px 18px;
}
.avisos { display: flex; flex-direction: column; gap: 10px; padding: 16px 20px 0; }
.avisos:empty { display: none; }
.aviso {
  display: flex; gap: 10px; align-items: flex-start; padding: 10px 14px; border-radius: 10px;
  background: var(--aviso); border: 1px solid var(--aviso-borde); font-size: 13px;
}
.aviso > svg { flex: none; margin-top: 1px; color: var(--aviso-icono); }
.aviso p, .aviso pre { margin: 0; }
.aviso pre { white-space: pre-wrap; font: inherit; }
.aviso--error { background: var(--error); border-color: var(--error-borde); }
.aviso--error > svg { color: var(--error-icono); }
.aviso--info { background: var(--superficie); border-color: var(--borde); color: var(--tenue); }
.aviso--info > svg { color: var(--acento); }
.texto-procesado {
  background: var(--superficie); border: 1px solid var(--borde); border-radius: 10px; font-size: 13px;
}
.texto-procesado summary { padding: 10px 14px; cursor: pointer; color: var(--acento); font-weight: 500; }
.texto-procesado p { margin: 0; padding: 0 14px 14px; white-space: pre-wrap; max-height: 260px; overflow: auto; }

.paginador {
  display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px 0 0;
  color: var(--tenue); font-size: 13px; font-variant-numeric: tabular-nums;
}

.vacio { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 64px 24px; color: var(--tenue); }
.vacio__ilustracion { width: 96px; margin-bottom: 18px; }
.vacio__ilustracion rect { fill: var(--superficie); stroke: var(--borde-fuerte); stroke-width: 1.5; }
.vacio__ilustracion line { stroke: var(--guia); stroke-width: 1.5; stroke-linecap: round; }
.vacio h3 { margin: 0 0 10px; color: var(--texto); font: 600 19px/1.3 var(--serif); }
.vacio ol { margin: 0; padding-left: 20px; text-align: left; line-height: 1.9; }

.hojas { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 24px 28px 40px; }
.hoja-wrap { display: flex; flex-direction: column; gap: 8px; }
.hoja__etiqueta { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--tenue); }
.hoja__etiqueta strong {
  padding: 1px 8px; border-radius: 99px; font-size: 11px; letter-spacing: 0.6px;
}
.hoja-wrap:has(.hoja--frente) .hoja__etiqueta strong { background: var(--frente-suave); color: var(--frente); }
.hoja-wrap:has(.hoja--vuelto) .hoja__etiqueta strong { background: var(--vuelto-suave); color: var(--vuelto); }
.hoja__id { margin-left: auto; font-size: 11.5px; }

/* ================= La hoja: medidas físicas exactas ================= */
.hoja {
  position: relative;
  width: ${PAPEL.anchoCm}cm;
  height: ${PAPEL.altoCm}cm;
  padding: var(--m-sup) var(--m-der) var(--m-inf) var(--m-izq);
  background: #fff;
  color: #000;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.12), 0 8px 24px rgba(16,24,40,0.12);
  overflow: hidden;
  color-scheme: light;
}
.hoja__caja {
  position: relative;
  height: calc(${LINEAS_POR_CARA} * ${INTERLINEADO_PT}pt);
  background-image: ${cuadricula('var(--guia)')};
  outline: 1px dashed rgba(36, 68, 156, 0.25);
}
.hoja__numeros {
  position: absolute; top: var(--m-sup); left: calc(var(--m-izq) - 0.9cm); width: 0.7cm;
  display: flex; flex-direction: column; text-align: right; font: 7pt/24pt system-ui, sans-serif; color: #9aa6bd;
}
.hoja__numeros span { height: ${INTERLINEADO_PT}pt; }
.renglon {
  height: ${INTERLINEADO_PT}pt;
  line-height: ${INTERLINEADO_PT}pt;          /* "Exacto a 24 puntos" */
  overflow: hidden;
  text-align: justify;
  text-align-last: justify;
  hyphens: none;
  font-weight: 400;
  font-style: normal;
}
.renglon--fin { text-align-last: left; }

/* Vista de impresión: replica en pantalla las reglas de @media print. */
.vista-impresion .hoja__caja {
  background-image: none;
  outline: none;
  transform: translate(var(--cal-x, 0), var(--cal-y, 0));
}
.vista-impresion.imprimir-guias .hoja__caja { outline: 1px dashed #7d93bd; }
/*
 * Renglones guía impresos: un borde por renglón en vez de un degradado. Los degradados con
 * transparencia pueden salir como un bloque negro al guardar en PDF; los bordes no, y además se
 * imprimen aunque «Gráficos de fondo» esté desactivado.
 */
.vista-impresion.imprimir-guias .renglon { position: relative; }
.vista-impresion.imprimir-guias .renglon::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 0; border-top: 1px solid #7d93bd;
}
/* Renglones del papel de protocolo: fijos en la hoja (la calibración solo mueve el texto). */
@media screen {
  .vista-impresion .hoja::before {
    content: '';
    position: absolute;
    top: var(--m-sup);
    left: var(--m-izq);
    right: var(--m-der);
    height: calc(${LINEAS_POR_CARA} * ${INTERLINEADO_PT}pt);
    background-image: ${cuadricula('#aab3c2')};
    pointer-events: none;
  }
}

/* ================= Testimonio (papel bond, texto corrido) ================= */
.pagina-testimonio {
  position: relative;
  background: #fff;
  color: #000;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.12), 0 8px 24px rgba(16,24,40,0.12);
  overflow: hidden;
  text-align: justify;
  hyphens: none;
  color-scheme: light;
}
.pagina-testimonio p { margin: 0; }
.pagina-testimonio p.cortado { text-align-last: justify; }

/* ================= Selector de tipo de documento ================= */
.tipo-documento { margin: 0; padding: 16px 0 18px; border: 0; border-bottom: 1px solid var(--borde); }
.tipo-documento legend {
  float: left; width: 100%; margin-bottom: 10px; padding: 0;
  font-size: 11.5px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--tenue);
}
.tipo-documento__opciones { clear: both; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.tarjeta-tipo {
  position: relative; display: flex; align-items: center; gap: 10px; padding: 12px;
  border: 1px solid var(--borde); border-radius: 10px; background: var(--superficie-2);
  cursor: pointer; transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.tarjeta-tipo:hover { border-color: var(--borde-fuerte); }
.tarjeta-tipo input { position: absolute; opacity: 0; pointer-events: none; }
.tarjeta-tipo:has(input:focus-visible) { outline: 2px solid var(--acento); outline-offset: 2px; }
.tarjeta-tipo--activa { border-color: var(--acento); background: var(--acento-suave); box-shadow: 0 0 0 1px var(--acento) inset; }
.tarjeta-tipo__icono {
  display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: 8px;
  background: var(--superficie); color: var(--tenue); border: 1px solid var(--borde);
}
.tarjeta-tipo--activa .tarjeta-tipo__icono { color: var(--acento); border-color: transparent; }
.tarjeta-tipo__textos { display: flex; flex-direction: column; min-width: 0; }
.tarjeta-tipo__textos strong { font-size: 14px; }
.tarjeta-tipo__textos small { font-size: 11.5px; color: var(--tenue); line-height: 1.3; }
.ayuda--arriba { margin: -4px 0 0; }
.ayuda--pie { margin: 0 0 10px; color: var(--error-icono); }
.campo input[aria-invalid="true"] { border-color: var(--error-borde); }

/* ================= Modal de impresión asistida ================= */
.modal {
  position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 16px;
  background: rgba(9, 13, 22, 0.55); backdrop-filter: blur(3px);
}
.modal__caja {
  width: min(560px, 100%); padding: 26px; border-radius: 16px;
  background: var(--superficie); color: var(--texto); box-shadow: 0 24px 64px rgba(0,0,0,0.35);
}
.modal__paso { margin: 0 0 8px; color: var(--tenue); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; }
.modal__titulo { margin: 0 0 16px; font: 600 20px/1.4 var(--serif); }
.modal__titulo--frente { border-left: 4px solid var(--frente); padding-left: 14px; }
.modal__titulo--vuelto { border-left: 4px solid var(--vuelto); padding-left: 14px; }
.modal__ayuda {
  margin: 0 0 22px; padding: 12px 14px 12px 32px; border-radius: 10px;
  background: var(--superficie-2); color: var(--tenue); font-size: 13px;
}
.modal__acciones { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }

/* ================= Pantallas angostas ================= */
@media (max-width: 1080px) {
  .shell { grid-template-columns: minmax(0, 1fr); height: auto; min-height: 100vh; }
  .menu-lateral {
    position: fixed; inset: 0 auto 0 0; z-index: 40; width: 264px;
    transform: translateX(-100%); transition: transform 0.2s ease;
  }
  .menu-lateral--abierto { transform: none; box-shadow: 0 0 48px rgba(0,0,0,0.4); }
  .menu-velo--visible { display: block; position: fixed; inset: 0; z-index: 39; background: rgba(9,13,22,0.45); }
  .encabezado { padding: 16px 16px 0; }
  .encabezado__menu { display: inline-grid !important; }
  .encabezado h1 { font-size: 22px; }
  .inicio { grid-template-columns: minmax(0, 1fr); padding: 16px; }
  .panel-ajustes__cuerpo, .mesa { overflow: visible; }
  .area { overflow: visible; }
  .mesa { overflow-x: auto; }
  .hojas { align-items: flex-start; padding: 16px; }
}
@media (max-width: 480px) {
  .rejilla { grid-template-columns: minmax(0, 1fr); }
  .paso__cabecera { flex-wrap: wrap; }
  .selector-tema__texto { display: none; }
  .selector-tema button { padding: 6px 9px; }
}

/* ================= Impresión ================= */
/* @page se genera en Inicio según el papel del documento (protocolo, carta u oficio). */
@media print {
  /* Siempre claro: con tema oscuro y «Gráficos de fondo» desactivado, Chrome deja el lienzo negro. */
  :root, :root[data-theme] { color-scheme: light !important; }
  html, body, #root { height: auto !important; background: #fff !important; color: #000 !important; }
  .no-print, .hoja__etiqueta, .hoja__numeros { display: none !important; }
  .shell, .principal, .inicio, .area, .mesa {
    display: block !important; height: auto !important; min-height: 0 !important; overflow: visible !important;
    padding: 0 !important; margin: 0 !important; border: 0 !important; box-shadow: none !important;
    background: none !important;
  }
  .hojas { zoom: 1 !important; display: block !important; padding: 0 !important; }
  .hoja-wrap { display: block; break-after: page; }
  .hoja-wrap:last-child { break-after: auto; }
  .pagina-testimonio { box-shadow: none; border-radius: 0; height: calc(var(--alto) - 0.05cm) !important; }
  /*
   * La caja impresa termina en el último renglón (no ocupa los 28 cm): así nunca desborda el papel,
   * aunque la impresora tenga Carta (27.94 cm) como tamaño predeterminado, y no aparece una hoja extra.
   */
  .hoja {
    box-shadow: none;
    border-radius: 0;
    height: auto;
    padding-bottom: 0;
  }
  .hoja__caja { background-image: none; outline: none; transform: translate(var(--cal-x, 0), var(--cal-y, 0)); }
  .imprimir-guias .hoja__caja { outline: 1px dashed #7d93bd; }
  .imprimir-guias .renglon { position: relative; }
  .imprimir-guias .renglon::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: 0; border-top: 1px solid #7d93bd;
  }
}
`;
