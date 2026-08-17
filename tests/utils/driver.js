const fs = require('fs');
const path = require('path');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('../config');

const EVIDENCE_DIR = path.join(__dirname, '..', 'evidencia');

/**
 * Crea una instancia de Chrome lista para usar.
 *
 * Selenium 4 incluye "Selenium Manager", que descarga y configura
 * chromedriver automaticamente segun la version de Chrome instalada.
 * Por eso NO hace falta bajar ningun driver a mano.
 */
async function buildDriver() {
  const options = new chrome.Options();

  if (config.headless) {
    options.addArguments('--headless=new');
  }

  options.addArguments(
    `--window-size=${config.viewports.desktop.width},${config.viewports.desktop.height}`,
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    // Evita que Chrome ofrezca guardar contrasenas y tape la pantalla
    // con un popup justo cuando la prueba esta interactuando con el form.
    '--disable-features=PasswordCheck,AutofillServerCommunication',
    '--guest'
  );

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  // Espera implicita en 0 a proposito: mezclarla con esperas explicitas
  // produce tiempos impredecibles. Todas las esperas de estas pruebas
  // son explicitas (helpers.waitVisible).
  await driver.manage().setTimeouts({ implicit: 0 });

  return driver;
}

/**
 * Guarda una captura PNG en la carpeta evidencia/.
 * Se usa automaticamente cuando una prueba falla, y sirve como respaldo
 * documental del punto 8 del plan de pruebas.
 */
async function takeScreenshot(driver, name) {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }

  const safeName = name.replace(/[^a-z0-9\-_]/gi, '_').slice(0, 80);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(EVIDENCE_DIR, `${stamp}__${safeName}.png`);

  const image = await driver.takeScreenshot();
  fs.writeFileSync(filePath, image, 'base64');

  return filePath;
}

module.exports = { buildDriver, takeScreenshot, EVIDENCE_DIR };
