// Estos valores deben coincidir EXACTAMENTE con los ENUM definidos en
// 002_reports.sql. Si se agrega una categoría o provincia, hay que tocar
// ambos lugares (la migración con ALTER TYPE ... ADD VALUE, y esta lista).
const CATEGORIES = [
  'Hoyos en la vía',
  'Aceras rotas',
  'Luminarias apagadas',
  'Drenaje obstruido',
  'Basura acumulada',
  'Señalización dañada',
];

const PROVINCES = [
  'Santo Domingo',
  'Distrito Nacional',
  'Santiago',
  'San Cristóbal',
  'La Altagracia',
];

module.exports = { CATEGORIES, PROVINCES };
