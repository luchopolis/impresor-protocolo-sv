import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatearProtocolo, validarPeticion } from '../src/protocolo.js';
import { fechaExpedicionALetras } from '../src/texto/razonTestimonio.js';

const parrafoLargo = Array.from({ length: 900 }, (_, i) => (i % 7 === 0 ? 'compareciente' : 'notario')).join(' ');

const peticion = (testimonio: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
  validarPeticion({
    tipoDocumento: 'testimonio',
    texto: `Primero 25 párrafo.\n${parrafoLargo}\nPaso ante mí: DOY FE.`,
    lineaInicio: 1,
    tamanoFuente: '12pt',
    tipoFuente: 'Arial',
    ladoInicial: 'frente',
    modoSalida: 'vista-previa',
    testimonio: {
      tamanoPapel: 'carta',
      interlineado: 1.5,
      libroNumero: 20,
      folioInicial: 15,
      folioFinal: 17,
      nombreCliente: 'ANA SOFÍA GÓMEZ DE CASTRO',
      numeroTestimonio: 'PRIMER',
      fechaExpedicion: '2026-10-19',
      ...testimonio,
    },
    ...extra,
  });

test('fecha de expedición en letras', () => {
  assert.equal(fechaExpedicionALetras('2026-10-19'), 'a los diecinueve días del mes de octubre de dos mil veintiséis');
  assert.equal(fechaExpedicionALetras('2026-03-01'), 'al primer día del mes de marzo de dos mil veintiséis');
});

test('testimonio: texto de corrido con la razón al final y los folios indicados', () => {
  const r = formatearProtocolo(peticion({}));
  assert.equal(r.tipoDocumento, 'testimonio');
  assert.equal(r.pages.length, 0);
  const t = r.testimonio!;
  assert.equal(t.folioInicial, 15);
  assert.equal(t.folioFinal, 17);
  assert.equal(t.parrafos[0], 'Primero veinticinco párrafo.');
  assert.equal(t.parrafos.at(-1), t.razon);
  assert.equal(
    t.razon,
    'PASÓ ANTE MÍ: Al Folio quince al Folio diecisiete ' +
      'de mi Protocolo Número veinte, que vence el presente año; y para seguridad de ANA SOFÍA GÓMEZ DE CASTRO, ' +
      'expido este PRIMER TESTIMONIO, en la ciudad de San Salvador, a los diecinueve días del mes de octubre de dos mil ' +
      'veintiséis, el cual sello y firmo en hojas de papel bond útiles.',
  );
});

test('testimonio sin convertir cifras deja los datos en números', () => {
  const r = formatearProtocolo(peticion({ ciudad: 'Santa Ana' }, { convertirNumeros: false }));
  assert.match(r.testimonio!.razon, /^PASÓ ANTE MÍ: Al Folio 15 al Folio 17 de mi Protocolo Número 20,/);
  assert.match(r.testimonio!.razon, /ciudad de Santa Ana, a los 19 días del mes de octubre de 2026,/);
});

test('testimonio valida sus datos', () => {
  assert.throws(
    () =>
      peticion({ nombreCliente: ' ', libroNumero: 0, fechaExpedicion: '2026-02-30', numeroTestimonio: 'X', folioFinal: 3 }),
    (e: { detalles: string[] }) => e.detalles.length === 5,
  );
});
