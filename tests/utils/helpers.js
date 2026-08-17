const { By, until } = require('selenium-webdriver');
const config = require('../config');

/** Localizador corto para data-testid. */
const testId = (id) => By.css(`[data-testid="${id}"]`);

/** Espera a que un elemento exista Y sea visible; devuelve el elemento. */
async function waitVisible(driver, locator, timeout = config.timeout) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

/** Espera a que un elemento DESAPAREZCA del DOM. */
async function waitGone(driver, locator, timeout = config.timeout) {
  await driver.wait(async () => {
    const found = await driver.findElements(locator);
    return found.length === 0;
  }, timeout);
}

/** Espera a que la URL contenga cierta ruta (ej. "/feed"). */
async function waitUrlContains(driver, fragment, timeout = config.timeout) {
  await driver.wait(until.urlContains(fragment), timeout);
}

/** Escribe en un campo, limpiandolo antes. */
async function type(driver, id, value) {
  const field = await waitVisible(driver, testId(id));
  await field.clear();
  await field.sendKeys(value);
  return field;
}

/** Hace clic en un elemento por su data-testid. */
async function click(driver, id) {
  const element = await waitVisible(driver, testId(id));
  await element.click();
  return element;
}

/**
 * Selecciona una opcion de un <select> nativo.
 * El binding de JavaScript de Selenium no trae la clase Select (a
 * diferencia de Java o Python), asi que se localiza la <option> por su
 * texto y se le hace clic, que es lo que dispara el onChange de React.
 */
async function selectOption(driver, id, visibleText) {
  const select = await waitVisible(driver, testId(id));
  const option = await select.findElement(
    By.xpath(`.//option[normalize-space(.)="${visibleText}"]`)
  );
  await option.click();
  return select;
}

/** Devuelve el texto de un elemento, o null si no existe. */
async function textOf(driver, id) {
  const found = await driver.findElements(testId(id));
  if (found.length === 0) return null;
  return (await found[0].getText()).trim();
}

/** Genera un correo unico para no chocar con registros previos. */
function uniqueEmail(prefix = 'user') {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 1000)}@test.do`;
}

/** Genera un titulo unico de reporte, para localizarlo despues sin ambiguedad. */
function uniqueTitle(prefix = 'Reporte QA') {
  return `${prefix} ${Date.now()}`;
}

/** Registra un usuario nuevo desde la interfaz. Devuelve sus credenciales. */
async function registerUser(driver, overrides = {}) {
  const user = {
    fullName: 'Usuario De Prueba',
    email: uniqueEmail(),
    password: 'Pruebas2026',
    ...overrides,
  };

  await driver.get(`${config.baseUrl}/register`);
  await type(driver, 'register-fullname', user.fullName);
  await type(driver, 'register-email', user.email);
  await type(driver, 'register-password', user.password);
  await click(driver, 'register-submit');

  return user;
}

/** Inicia sesion desde la interfaz y espera a que el feed cargue. */
async function login(driver, { email, password }) {
  await driver.get(`${config.baseUrl}/login`);
  await type(driver, 'login-email', email);
  await type(driver, 'login-password', password);
  await click(driver, 'login-submit');
  await waitUrlContains(driver, '/feed');
  await waitVisible(driver, testId('feed-page'));
}

/**
 * Garantiza que el usuario semilla exista y deja la sesion iniciada.
 * Si el correo ya estaba registrado, el registro falla con 409 y
 * simplemente se procede a iniciar sesion: el resultado es el mismo.
 */
async function loginAsSeedUser(driver) {
  const { fullName, email, password } = config.seedUser;

  await driver.get(`${config.baseUrl}/register`);
  await type(driver, 'register-fullname', fullName);
  await type(driver, 'register-email', email);
  await type(driver, 'register-password', password);
  await click(driver, 'register-submit');

  // Da un margen para que resuelva el registro (exito o correo duplicado)
  // antes de navegar al login.
  await driver.sleep(800);
  await login(driver, { email, password });

  return config.seedUser;
}

/** Crea un reporte desde la interfaz. Devuelve los datos usados. */
async function createReport(driver, overrides = {}) {
  const report = {
    title: uniqueTitle(),
    description: 'Descripcion generada por la prueba automatizada.',
    category: 'Hoyos en la vía',
    province: 'Santo Domingo',
    ...overrides,
  };

  await click(driver, 'new-report-button');
  await waitVisible(driver, testId('report-form'));
  await type(driver, 'report-title-input', report.title);
  await type(driver, 'report-description-input', report.description);
  await selectOption(driver, 'report-category-select', report.category);
  await selectOption(driver, 'report-province-select', report.province);
  await click(driver, 'report-submit');
  await waitGone(driver, testId('report-form'));

  return report;
}

/** Devuelve la tarjeta del feed cuyo titulo coincide exactamente. */
async function findCardByTitle(driver, title, timeout = config.timeout) {
  const locator = By.xpath(
    `//*[@data-testid="report-card"][.//*[@data-testid="report-title"][normalize-space(.)="${title}"]]`
  );
  return waitVisible(driver, locator, timeout);
}

/** True si existe una tarjeta con ese titulo (sin esperar). */
async function cardExists(driver, title) {
  const cards = await driver.findElements(
    By.xpath(
      `//*[@data-testid="report-card"][.//*[@data-testid="report-title"][normalize-space(.)="${title}"]]`
    )
  );
  return cards.length > 0;
}

/** Devuelve los titulos de todas las tarjetas visibles, en orden. */
async function listCardTitles(driver) {
  const titles = await driver.findElements(testId('report-title'));
  return Promise.all(titles.map((t) => t.getText()));
}

module.exports = {
  testId,
  waitVisible,
  waitGone,
  waitUrlContains,
  type,
  click,
  selectOption,
  textOf,
  uniqueEmail,
  uniqueTitle,
  registerUser,
  login,
  loginAsSeedUser,
  createReport,
  findCardByTitle,
  cardExists,
  listCardTitles,
};
