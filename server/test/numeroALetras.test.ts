import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  decimalALetras,
  enteroALetras,
  horaALetras,
  montoALetras,
} from '../src/texto/numeroALetras.js';
import { convertirCifrasALetras } from '../src/texto/procesarTexto.js';

test('enteros', () => {
  const casos: [number, string][] = [
    [0, 'cero'],
    [1, 'uno'],
    [16, 'dieciséis'],
    [21, 'veintiuno'],
    [31, 'treinta y uno'],
    [100, 'cien'],
    [101, 'ciento uno'],
    [999, 'novecientos noventa y nueve'],
    [1000, 'mil'],
    [2024, 'dos mil veinticuatro'],
    [21000, 'veintiún mil'],
    [1_000_000, 'un millón'],
    [2_500_000, 'dos millones quinientos mil'],
    [1_000_000_000_000, 'un billón'],
  ];
  for (const [n, esperado] of casos) assert.equal(enteroALetras(n), esperado, String(n));
});

test('género', () => {
  assert.equal(enteroALetras(21, 'femenino'), 'veintiuna');
  assert.equal(enteroALetras(31, 'masculino'), 'treinta y un');
  assert.equal(enteroALetras(200, 'femenino'), 'doscientas');
});

test('decimales, montos y horas', () => {
  assert.equal(decimalALetras('12.5'), 'doce punto cinco');
  assert.equal(decimalALetras('0.05'), 'cero punto cero cinco');
  assert.equal(montoALetras('1'), 'un dólar de los Estados Unidos de América');
  assert.equal(
    montoALetras('1,250.50'),
    'mil doscientos cincuenta dólares de los Estados Unidos de América con cincuenta centavos de dólar',
  );
  assert.equal(montoALetras('2000000'), 'dos millones de dólares de los Estados Unidos de América');
  assert.equal(horaALetras(14, 30), 'catorce horas y treinta minutos');
  assert.equal(horaALetras(21, 0), 'veintiuna horas');
  assert.equal(horaALetras(1, 21), 'una hora y veintiún minutos');
});

test('conversión dentro del texto legal', () => {
  const casos: [string, string][] = [
    ['el 15/03/2024 a las 10:30', 'el quince de marzo de dos mil veinticuatro a las diez horas y treinta minutos'],
    ['a las 3:15 p.m.', 'a las quince horas y quince minutos'],
    ['a las 14:00 horas', 'a las catorce horas'],
    ['la suma de $5,000.00 dólares', 'la suma de cinco mil dólares de los Estados Unidos de América'],
    ['la suma de 300 dólares de los Estados Unidos de América', 'la suma de trescientos dólares de los Estados Unidos de América'],
    ['interés del 2.5% mensual', 'interés del dos punto cinco por ciento mensual'],
    ['DUI 01234567-8', 'DUI cero uno dos tres cuatro cinco seis siete guion ocho'],
    ['NIT 0614-010190-101-1', 'NIT cero seis uno cuatro guion cero uno cero uno nueve cero guion uno cero uno guion uno'],
    ['pasaporte número A1234567', 'pasaporte número A uno dos tres cuatro cinco seis siete'],
    ['de 45 años', 'de cuarenta y cinco años'],
    ['cláusula 1°', 'cláusula primero'],
  ];
  for (const [entrada, esperado] of casos) assert.equal(convertirCifrasALetras(entrada), esperado, entrada);
});
