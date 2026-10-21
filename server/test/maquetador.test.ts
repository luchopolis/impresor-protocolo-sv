import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LINEAS_POR_CARA, anchoUtilPt } from '../src/constantes.js';
import { maquetar, separarCierre } from '../src/maquetacion/maquetador.js';
import { crearMedidor } from '../src/maquetacion/metricas.js';
import { formatearProtocolo, validarPeticion } from '../src/protocolo.js';

const base = {
  lineaInicio: 1,
  tipoFuente: 'Arial',
  tamanoPt: 12,
  ladoInicial: 'frente' as const,
  folioInicial: 1,
  lineasFirma: 4,
  rellenarGuiones: true,
};

const parrafoLargo = (palabras: number) =>
  Array.from({ length: palabras }, (_, i) => (i % 7 === 0 ? 'compareciente' : 'notario')).join(' ');

test('tabla de métricas completa (95 caracteres ASCII)', () => {
  const m = crearMedidor('Arial', 1000);
  assert.equal(Math.round(m.ancho('~')), 584);
  assert.equal(Math.round(m.ancho('á')), 556);
});

test('cada cara tiene exactamente 24 renglones y alterna frente/vuelto', () => {
  const { caras } = maquetar([parrafoLargo(900), 'Paso ante mí: DOY FE.'], base);
  assert.ok(caras.length > 2);
  caras.forEach((c, i) => {
    assert.equal(c.content.split('\n').length, LINEAS_POR_CARA);
    assert.equal(c.type, i % 2 === 0 ? 'frente' : 'vuelto');
    assert.equal(c.folioNum, Math.floor(i / 2) + 1);
  });
});

test('ningún renglón excede el ancho útil de su cara', () => {
  const m = crearMedidor('Arial', 12);
  const { caras } = maquetar([parrafoLargo(900), 'Paso ante mí.'], base);
  for (const c of caras) {
    for (const l of c.content.split('\n')) assert.ok(m.ancho(l) <= anchoUtilPt(c.type), l);
  }
});

test('las líneas previas a lineaInicio quedan vacías', () => {
  const { caras } = maquetar(['Texto breve.', 'Paso ante mí.'], { ...base, lineaInicio: 10 });
  const lineas = caras[0].content.split('\n');
  assert.ok(lineas.slice(0, 9).every((l) => l === ''));
  assert.match(lineas[9], /^Texto breve\. -+$/);
});

test('el último renglón de cada párrafo se rellena con guiones', () => {
  const { caras } = maquetar(['Primero.', 'Paso ante mí.'], base);
  const [l1, l2] = caras[0].content.split('\n');
  assert.match(l1, /^Primero\. -{20,}$/);
  assert.match(l2, /^Paso ante mí\. -{20,}$/);
});

test('si el cuerpo termina en el renglón 24 del frente, el cierre pasa al vuelto', () => {
  // 24 párrafos cortos = 24 renglones exactos en el frente.
  const cuerpo = Array.from({ length: 24 }, (_, i) => `Renglón ${i}.`);
  const { caras } = maquetar([...cuerpo, 'Paso ante mí: DOY FE.'], base);
  assert.equal(caras.length, 2);
  assert.equal(caras[1].type, 'vuelto');
  assert.match(caras[1].content.split('\n')[0], /^Paso ante mí/);
});

test('el bloque de cierre no se parte: renglones sobrantes se inutilizan con guiones', () => {
  const cuerpo = Array.from({ length: 22 }, (_, i) => `Renglón ${i}.`);
  const { caras, advertencias } = maquetar([...cuerpo, 'Paso ante mí: DOY FE.'], base);
  const frente = caras[0].content.split('\n');
  assert.match(frente[22], /^-+$/);
  assert.match(frente[23], /^-+$/);
  assert.match(caras[1].content.split('\n')[0], /^Paso ante mí/);
  assert.equal(advertencias.length, 1);
});

test('"Paso ante mí" a mitad de párrafo se separa como cierre', () => {
  const r = separarCierre(['Uno.', 'Ratifican y firmamos. Paso ante mí: DOY FE.']);
  assert.deepEqual(r.cuerpo, ['Uno.', 'Ratifican y firmamos.']);
  assert.deepEqual(r.cierre, ['Paso ante mí: DOY FE.']);
});

test('solo-vueltos filtra caras y lado inicial vuelto avanza el folio', () => {
  const req = validarPeticion({
    texto: `${parrafoLargo(900)}\nPaso ante mí.`,
    lineaInicio: 1,
    tamanoFuente: '12pt',
    tipoFuente: 'Arial',
    ladoInicial: 'vuelto',
    modoSalida: 'solo-vueltos',
    folioInicial: 7,
  });
  const res = formatearProtocolo(req);
  assert.ok(res.pages.every((p) => p.type === 'vuelto'));
  assert.equal(res.pages[0].folioNum, 7);
  assert.equal(res.pages[1].folioNum, 8);
});

test('validación rechaza opciones inválidas', () => {
  assert.throws(() => validarPeticion({ texto: '', lineaInicio: 30, ladoInicial: 'x' }));
});
