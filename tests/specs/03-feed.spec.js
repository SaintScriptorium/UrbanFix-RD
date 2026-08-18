const assert = require('assert');
const { By } = require('selenium-webdriver');
const config = require('../config');
const { buildDriver, takeScreenshot } = require('../utils/driver');
const h = require('../utils/helpers');

describe('Epica 3 - Visualizacion de Incidencias', function () {
  let driver;

  before(async function () {
    driver = await buildDriver();
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

  describe('HU9 - Ver listado general de reportes', function () {
    beforeEach(async function () {
      await driver.get(`${config.baseUrl}/feed`);
      await h.waitVisible(driver, h.testId('feed-page'));
      await h.waitGone(driver, h.testId('feed-loading'));
    });

    it('CP-023: cada tarjeta muestra titulo, categoria, provincia y fecha', async function () {
      const reporte = await h.createReport(driver, {
        category: 'Drenaje obstruido',
        province: 'San Cristóbal',
      });

      const tarjeta = await h.findCardByTitle(driver, reporte.title);

      const titulo = await tarjeta.findElement(By.css('[data-testid="report-title"]'));
      const categoria = await tarjeta.findElement(By.css('[data-testid="report-category"]'));
      const provincia = await tarjeta.findElement(By.css('[data-testid="report-province"]'));
      const fecha = await tarjeta.findElement(By.css('[data-testid="report-date"]'));

      assert.strictEqual(await titulo.getText(), reporte.title);
      assert.strictEqual(await categoria.getText(), 'Drenaje obstruido');
      assert.strictEqual(await provincia.getText(), 'San Cristóbal');
      assert.ok((await fecha.getText()).length > 0, 'La fecha no debe estar vacia');
    });

    it('CP-024: ordena los reportes del mas reciente al mas antiguo', async function () {
      const primero = await h.createReport(driver, { title: h.uniqueTitle('Antiguo') });
      await driver.sleep(1200);
      const segundo = await h.createReport(driver, { title: h.uniqueTitle('Reciente') });

      await driver.navigate().refresh();
      await h.waitGone(driver, h.testId('feed-loading'));

      const titulos = await h.listCardTitles(driver);
      const posReciente = titulos.indexOf(segundo.title);
      const posAntiguo = titulos.indexOf(primero.title);

      assert.notStrictEqual(posReciente, -1, 'No se encontro el reporte reciente');
      assert.notStrictEqual(posAntiguo, -1, 'No se encontro el reporte antiguo');
      assert.ok(
        posReciente < posAntiguo,
        'El reporte mas reciente debe aparecer antes que el mas antiguo'
      );
    });

    it('CP-025 (RNF-02): el feed carga en menos de 3 segundos', async function () {
      const inicio = Date.now();

      await driver.get(`${config.baseUrl}/feed`);
      await h.waitVisible(driver, h.testId('feed-page'));
      await h.waitGone(driver, h.testId('feed-loading'));

      const transcurrido = Date.now() - inicio;

      assert.ok(
        transcurrido < config.feedLoadLimitMs,
        `El feed tardo ${transcurrido} ms; el limite es ${config.feedLoadLimitMs} ms`
      );
    });
  });

  describe('HU10 - Filtrar reportes por categoria', function () {
    let reporteHoyos;
    let reporteAceras;

    before(async function () {
      await driver.get(`${config.baseUrl}/feed`);
      await h.waitVisible(driver, h.testId('feed-page'));
      await h.waitGone(driver, h.testId('feed-loading'));

      reporteHoyos = await h.createReport(driver, {
        title: h.uniqueTitle('Filtro Hoyos'),
        category: 'Hoyos en la vía',
      });
      reporteAceras = await h.createReport(driver, {
        title: h.uniqueTitle('Filtro Aceras'),
        category: 'Aceras rotas',
      });
    });

    it('CP-026: muestra solo los reportes de la categoria seleccionada', async function () {
      await h.selectOption(driver, 'category-filter', 'Hoyos en la vía');
      await h.waitGone(driver, h.testId('feed-loading'));

      assert.strictEqual(await h.cardExists(driver, reporteHoyos.title), true);
      assert.strictEqual(await h.cardExists(driver, reporteAceras.title), false);
      const etiquetas = await driver.findElements(h.testId('report-category'));
      for (const etiqueta of etiquetas) {
        assert.strictEqual(await etiqueta.getText(), 'Hoyos en la vía');
      }
    });

    it('CP-027: "Ver todos" quita el filtro y muestra ambas categorias', async function () {
      await h.selectOption(driver, 'category-filter', 'Ver todos');
      await h.waitGone(driver, h.testId('feed-loading'));

      assert.strictEqual(await h.cardExists(driver, reporteHoyos.title), true);
      assert.strictEqual(await h.cardExists(driver, reporteAceras.title), true);
    });

    it('CP-028: muestra el estado vacio si la categoria no tiene reportes', async function () {
      await h.selectOption(driver, 'category-filter', 'Señalización dañada');
      await h.waitGone(driver, h.testId('feed-loading'));

      const tarjetas = await driver.findElements(h.testId('report-card'));

      if (tarjetas.length === 0) {
        const vacio = await h.waitVisible(driver, h.testId('feed-empty'));
        assert.match(await vacio.getText(), /no hay reportes/i);
      } else {
        const etiquetas = await driver.findElements(h.testId('report-category'));
        for (const etiqueta of etiquetas) {
          assert.strictEqual(await etiqueta.getText(), 'Señalización dañada');
        }
      }

      await h.selectOption(driver, 'category-filter', 'Ver todos');
    });
  });

  describe('HU11 - Interfaz responsiva (RNF-01)', function () {
    afterEach(async function () {
      const { width, height } = config.viewports.desktop;
      await driver.manage().window().setRect({ width, height });
    });

    async function medirDesbordeHorizontal() {
      return driver.executeScript(
        'return document.documentElement.scrollWidth - document.documentElement.clientWidth;'
      );
    }

    it('CP-029: el feed se adapta a resolucion movil (375x812) sin scroll horizontal', async function () {
      const { width, height } = config.viewports.mobile;
      await driver.manage().window().setRect({ width, height });

      await driver.get(`${config.baseUrl}/feed`);
      await h.waitVisible(driver, h.testId('feed-page'));
      await h.waitGone(driver, h.testId('feed-loading'));

      const desborde = await medirDesbordeHorizontal();
      assert.ok(desborde <= 1, `Hay desborde horizontal de ${desborde} px en movil`);
      const boton = await h.waitVisible(driver, h.testId('new-report-button'));
      const filtro = await h.waitVisible(driver, h.testId('category-filter'));
      assert.ok(await boton.isDisplayed());
      assert.ok(await filtro.isDisplayed());
    });

    it('CP-030: el formulario de login se adapta a resolucion movil', async function () {
      const { width, height } = config.viewports.mobile;
      await driver.manage().window().setRect({ width, height });

      await driver.get(`${config.baseUrl}/login`);
      await h.waitVisible(driver, h.testId('login-form'));

      const desborde = await medirDesbordeHorizontal();
      assert.ok(desborde <= 1, `Hay desborde horizontal de ${desborde} px en login movil`);

      const correo = await driver.findElement(h.testId('login-email'));
      assert.ok(await correo.isDisplayed());
    });

    it('CP-031: el feed se visualiza correctamente en escritorio (1440x900)', async function () {
      const { width, height } = config.viewports.desktop;
      await driver.manage().window().setRect({ width, height });

      await driver.get(`${config.baseUrl}/feed`);
      await h.waitVisible(driver, h.testId('feed-page'));
      await h.waitGone(driver, h.testId('feed-loading'));

      const desborde = await medirDesbordeHorizontal();
      assert.ok(desborde <= 1, `Hay desborde horizontal de ${desborde} px en escritorio`);

      const nombre = await h.waitVisible(driver, h.testId('feed-user-name'));
      assert.ok(await nombre.isDisplayed());
    });
  });
});
