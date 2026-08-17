const assert = require('assert');
const { By } = require('selenium-webdriver');
const config = require('../config');
const { buildDriver, takeScreenshot } = require('../utils/driver');
const h = require('../utils/helpers');

describe('Epica 2 - Gestion de Reportes', function () {
  let driver;

  before(async function () {
    driver = await buildDriver();
    // Una sola sesion para toda la suite: iniciar sesion en cada prueba
    // multiplicaria el tiempo de ejecucion sin aportar cobertura.
    await h.loginAsSeedUser(driver);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed' && driver) {
      await takeScreenshot(driver, this.currentTest.title);
    }
  });

  // Cada prueba arranca desde un feed limpio y cargado.
  beforeEach(async function () {
    await driver.get(`${config.baseUrl}/feed`);
    await h.waitVisible(driver, h.testId('feed-page'));
    await h.waitGone(driver, h.testId('feed-loading'));
  });

  describe('HU5 - Crear reporte de incidencia', function () {
    it('CP-013: crea un reporte valido y lo muestra en el feed', async function () {
      const reporte = await h.createReport(driver, {
        category: 'Aceras rotas',
        province: 'Santiago',
      });

      const tarjeta = await h.findCardByTitle(driver, reporte.title);

      const categoria = await tarjeta.findElement(By.css('[data-testid="report-category"]'));
      const provincia = await tarjeta.findElement(By.css('[data-testid="report-province"]'));

      assert.strictEqual(await categoria.getText(), 'Aceras rotas');
      assert.strictEqual(await provincia.getText(), 'Santiago');
    });

    it('CP-014: asocia el reporte al usuario autenticado', async function () {
      const reporte = await h.createReport(driver);
      const tarjeta = await h.findCardByTitle(driver, reporte.title);

      const autor = await tarjeta.findElement(By.css('[data-testid="report-author"]'));
      assert.match(await autor.getText(), new RegExp(config.seedUser.fullName, 'i'));
    });

    it('CP-015: bloquea el envio si faltan campos obligatorios', async function () {
      await h.click(driver, 'new-report-button');
      await h.waitVisible(driver, h.testId('report-form'));

      // Se envia el formulario completamente vacio.
      await h.click(driver, 'report-submit');

      assert.ok(await h.textOf(driver, 'report-title-input-error'));
      assert.ok(await h.textOf(driver, 'report-description-input-error'));
      assert.ok(await h.textOf(driver, 'report-category-select-error'));
      assert.ok(await h.textOf(driver, 'report-province-select-error'));

      // El modal debe seguir abierto: no se envio nada.
      await h.waitVisible(driver, h.testId('report-form'));
      await h.click(driver, 'report-cancel');
    });

    it('CP-016: bloquea el envio si falta solo la categoria', async function () {
      await h.click(driver, 'new-report-button');
      await h.waitVisible(driver, h.testId('report-form'));

      await h.type(driver, 'report-title-input', h.uniqueTitle('Sin categoria'));
      await h.type(driver, 'report-description-input', 'Descripcion completa.');
      await h.selectOption(driver, 'report-province-select', 'Santo Domingo');
      await h.click(driver, 'report-submit');

      assert.ok(await h.textOf(driver, 'report-category-select-error'));
      await h.waitVisible(driver, h.testId('report-form'));
      await h.click(driver, 'report-cancel');
    });
  });

  describe('HU6 - Editar reporte de incidencia', function () {
    it('CP-017: edita un reporte y refleja los cambios en el feed', async function () {
      const original = await h.createReport(driver, {
        category: 'Luminarias apagadas',
        province: 'Santo Domingo',
      });

      const tarjeta = await h.findCardByTitle(driver, original.title);
      await tarjeta.findElement(By.css('[data-testid="report-edit"]')).click();
      await h.waitVisible(driver, h.testId('report-form'));

      const nuevoTitulo = h.uniqueTitle('Editado');
      await h.type(driver, 'report-title-input', nuevoTitulo);
      await h.type(driver, 'report-description-input', 'Descripcion actualizada por la prueba.');
      await h.selectOption(driver, 'report-province-select', 'Distrito Nacional');
      await h.click(driver, 'report-submit');
      await h.waitGone(driver, h.testId('report-form'));

      const editada = await h.findCardByTitle(driver, nuevoTitulo);
      const provincia = await editada.findElement(By.css('[data-testid="report-province"]'));
      assert.strictEqual(await provincia.getText(), 'Distrito Nacional');

      // El titulo anterior ya no debe existir.
      assert.strictEqual(await h.cardExists(driver, original.title), false);
    });

    it('CP-018: el formulario de edicion carga los datos actuales', async function () {
      const reporte = await h.createReport(driver, {
        category: 'Basura acumulada',
        province: 'La Altagracia',
      });

      const tarjeta = await h.findCardByTitle(driver, reporte.title);
      await tarjeta.findElement(By.css('[data-testid="report-edit"]')).click();
      await h.waitVisible(driver, h.testId('report-form'));

      const titulo = await driver.findElement(h.testId('report-title-input'));
      const categoria = await driver.findElement(h.testId('report-category-select'));
      const provincia = await driver.findElement(h.testId('report-province-select'));

      assert.strictEqual(await titulo.getAttribute('value'), reporte.title);
      assert.strictEqual(await categoria.getAttribute('value'), 'Basura acumulada');
      assert.strictEqual(await provincia.getAttribute('value'), 'La Altagracia');

      await h.click(driver, 'report-cancel');
    });
  });

  describe('HU7 - Eliminar reporte de incidencia', function () {
    it('CP-019: elimina el reporte al confirmar', async function () {
      const reporte = await h.createReport(driver);

      const tarjeta = await h.findCardByTitle(driver, reporte.title);
      await tarjeta.findElement(By.css('[data-testid="report-delete"]')).click();

      const dialogo = await h.waitVisible(driver, h.testId('confirm-dialog'));
      const mensaje = await dialogo.findElement(By.css('[data-testid="confirm-message"]'));
      assert.match(await mensaje.getText(), /seguro que deseas eliminar/i);

      await h.click(driver, 'confirm-accept');
      await h.waitGone(driver, h.testId('confirm-dialog'));

      // Se recarga para confirmar que la eliminacion fue persistida.
      await driver.navigate().refresh();
      await h.waitGone(driver, h.testId('feed-loading'));
      assert.strictEqual(await h.cardExists(driver, reporte.title), false);
    });

    it('CP-020: conserva el reporte al cancelar la eliminacion', async function () {
      const reporte = await h.createReport(driver);

      const tarjeta = await h.findCardByTitle(driver, reporte.title);
      await tarjeta.findElement(By.css('[data-testid="report-delete"]')).click();
      await h.waitVisible(driver, h.testId('confirm-dialog'));

      await h.click(driver, 'confirm-cancel');
      await h.waitGone(driver, h.testId('confirm-dialog'));

      assert.strictEqual(await h.cardExists(driver, reporte.title), true);
    });
  });

  describe('HU8 - Verificar reporte como completado', function () {
    it('CP-021: retira el reporte del feed al completarlo', async function () {
      const reporte = await h.createReport(driver);

      const tarjeta = await h.findCardByTitle(driver, reporte.title);
      await tarjeta.findElement(By.css('[data-testid="report-complete"]')).click();

      const dialogo = await h.waitVisible(driver, h.testId('confirm-dialog'));
      const mensaje = await dialogo.findElement(By.css('[data-testid="confirm-message"]'));
      assert.match(await mensaje.getText(), /fue completado|completado/i);

      await h.click(driver, 'confirm-accept');
      await h.waitGone(driver, h.testId('confirm-dialog'));

      await driver.navigate().refresh();
      await h.waitGone(driver, h.testId('feed-loading'));
      assert.strictEqual(await h.cardExists(driver, reporte.title), false);
    });

    it('CP-022: conserva el reporte al cancelar la accion de completar', async function () {
      const reporte = await h.createReport(driver);

      const tarjeta = await h.findCardByTitle(driver, reporte.title);
      await tarjeta.findElement(By.css('[data-testid="report-complete"]')).click();
      await h.waitVisible(driver, h.testId('confirm-dialog'));

      await h.click(driver, 'confirm-cancel');
      await h.waitGone(driver, h.testId('confirm-dialog'));

      assert.strictEqual(await h.cardExists(driver, reporte.title), true);
    });
  });
});
