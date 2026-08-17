const assert = require('assert');
const { By } = require('selenium-webdriver');
const config = require('../config');
const { buildDriver, takeScreenshot } = require('../utils/driver');
const h = require('../utils/helpers');

describe('Epica 1 - Gestion de Usuarios', function () {
  let driver;

  before(async function () {
    driver = await buildDriver();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  // Ante un fallo se guarda una captura automatica. Esa carpeta es la
  // evidencia del punto 8 del plan de pruebas.
  afterEach(async function () {
    if (this.currentTest.state === 'failed' && driver) {
      await takeScreenshot(driver, this.currentTest.title);
    }
  });

  describe('HU1 - Registro de usuario', function () {
    it('CP-001: registra un usuario valido y redirige al login', async function () {
      const user = {
        fullName: 'Ana Gomez',
        email: h.uniqueEmail('cp001'),
        password: 'Pruebas2026',
      };

      await driver.get(`${config.baseUrl}/register`);
      await h.type(driver, 'register-fullname', user.fullName);
      await h.type(driver, 'register-email', user.email);
      await h.type(driver, 'register-password', user.password);
      await h.click(driver, 'register-submit');

      await h.waitUrlContains(driver, '/login');
      const aviso = await h.waitVisible(driver, h.testId('login-registered-notice'));
      assert.match(await aviso.getText(), /Cuenta creada/i);
    });

    it('CP-002: rechaza un correo ya registrado', async function () {
      const email = h.uniqueEmail('cp002');

      // Primer registro: debe pasar.
      await h.registerUser(driver, { email });
      await h.waitUrlContains(driver, '/login');

      // Segundo registro con el mismo correo: debe fallar.
      await driver.get(`${config.baseUrl}/register`);
      await h.type(driver, 'register-fullname', 'Duplicado Prueba');
      await h.type(driver, 'register-email', email);
      await h.type(driver, 'register-password', 'Pruebas2026');
      await h.click(driver, 'register-submit');

      const error = await h.waitVisible(driver, h.testId('register-form-error'));
      assert.match(await error.getText(), /ya existe una cuenta/i);

      // Debe permanecer en /register, no avanzar.
      assert.ok((await driver.getCurrentUrl()).includes('/register'));
    });

    it('CP-003: rechaza una contrasena menor a 8 caracteres', async function () {
      await driver.get(`${config.baseUrl}/register`);
      await h.type(driver, 'register-fullname', 'Clave Corta');
      await h.type(driver, 'register-email', h.uniqueEmail('cp003'));
      await h.type(driver, 'register-password', 'abc123');
      await h.click(driver, 'register-submit');

      const error = await h.waitVisible(driver, h.testId('register-password-error'));
      assert.match(await error.getText(), /al menos 8 caracteres/i);
      assert.ok((await driver.getCurrentUrl()).includes('/register'));
    });

    it('CP-004: rechaza el formulario con campos vacios', async function () {
      await driver.get(`${config.baseUrl}/register`);
      await h.click(driver, 'register-submit');

      assert.ok(await h.textOf(driver, 'register-fullname-error'));
      assert.ok(await h.textOf(driver, 'register-email-error'));
      assert.ok(await h.textOf(driver, 'register-password-error'));
    });
  });

  describe('HU2 - Inicio de sesion', function () {
    it('CP-005: inicia sesion con credenciales correctas y redirige al feed', async function () {
      const user = await h.registerUser(driver, { email: h.uniqueEmail('cp005') });
      await h.waitUrlContains(driver, '/login');

      await h.type(driver, 'login-email', user.email);
      await h.type(driver, 'login-password', user.password);
      await h.click(driver, 'login-submit');

      await h.waitUrlContains(driver, '/feed');
      await h.waitVisible(driver, h.testId('feed-page'));

      const nombre = await h.waitVisible(driver, h.testId('feed-user-name'));
      assert.strictEqual(await nombre.getText(), user.fullName);
    });

    it('CP-006: rechaza credenciales incorrectas con mensaje generico', async function () {
      await driver.get(`${config.baseUrl}/login`);
      await h.type(driver, 'login-email', 'noexiste@test.do');
      await h.type(driver, 'login-password', 'ClaveIncorrecta1');
      await h.click(driver, 'login-submit');

      const error = await h.waitVisible(driver, h.testId('login-form-error'));
      const texto = await error.getText();

      // El criterio de HU2 exige que el mensaje NO revele cual campo fallo.
      assert.match(texto, /correo o contrasena incorrectos|correo o contraseña incorrectos/i);
      assert.doesNotMatch(texto, /el correo no existe|usuario no encontrado|contrasena incorrecta$/i);

      assert.ok((await driver.getCurrentUrl()).includes('/login'));
    });
  });

  describe('HU3 - Cierre de sesion', function () {
    it('CP-007: cierra sesion y redirige al login', async function () {
      await h.loginAsSeedUser(driver);

      await h.click(driver, 'logout-button');
      await h.waitUrlContains(driver, '/login');
      await h.waitVisible(driver, h.testId('login-form'));
    });

    it('CP-008: elimina el token del navegador al cerrar sesion', async function () {
      await h.loginAsSeedUser(driver);

      const tokenAntes = await driver.executeScript(
        "return window.localStorage.getItem('urbanfix_token');"
      );
      assert.ok(tokenAntes, 'Debia existir un token tras iniciar sesion');

      await h.click(driver, 'logout-button');
      await h.waitUrlContains(driver, '/login');

      const tokenDespues = await driver.executeScript(
        "return window.localStorage.getItem('urbanfix_token');"
      );
      assert.strictEqual(tokenDespues, null, 'El token debio eliminarse');
    });

    it('CP-009: bloquea el acceso a /feed sin sesion activa', async function () {
      // Limpia cualquier sesion previa.
      await driver.get(`${config.baseUrl}/login`);
      await driver.executeScript('window.localStorage.clear();');

      await driver.get(`${config.baseUrl}/feed`);

      await h.waitUrlContains(driver, '/login');
      await h.waitVisible(driver, h.testId('login-form'));
    });
  });

  describe('HU4 - Validacion de credenciales y seguridad', function () {
    it('CP-010: los campos de contrasena estan enmascarados', async function () {
      await driver.get(`${config.baseUrl}/register`);
      const registro = await h.waitVisible(driver, h.testId('register-password'));
      assert.strictEqual(await registro.getAttribute('type'), 'password');

      await driver.get(`${config.baseUrl}/login`);
      const inicio = await h.waitVisible(driver, h.testId('login-password'));
      assert.strictEqual(await inicio.getAttribute('type'), 'password');
    });

    it('CP-011: la contrasena nunca se almacena en el navegador', async function () {
      const { password } = await h.loginAsSeedUser(driver);

      const almacenado = await driver.executeScript(`
        return JSON.stringify({
          local: window.localStorage,
          session: window.sessionStorage
        });
      `);

      assert.ok(
        !almacenado.includes(password),
        'La contrasena en texto plano no debe aparecer en localStorage ni sessionStorage'
      );
    });

    it('CP-012: la respuesta del login no devuelve el hash de la contrasena', async function () {
      const { email, password } = config.seedUser;

      // Hay que estar en una pagina de la app para que el fetch salga con
      // el mismo origen y CORS no lo bloquee.
      await driver.get(`${config.baseUrl}/login`);

      // executeAsyncScript permite esperar una promesa dentro del navegador:
      // el ultimo argumento (done) es el callback que devuelve el resultado.
      const respuesta = await driver.executeAsyncScript(
        function (url, correo, clave, done) {
          fetch(url + '/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: correo, password: clave }),
          })
            .then(function (r) { return r.json(); })
            .then(function (data) { done(JSON.stringify(data)); })
            .catch(function (e) { done('ERROR:' + e.message); });
        },
        config.apiUrl,
        email,
        password
      );

      assert.ok(!respuesta.startsWith('ERROR:'), `Fallo la peticion: ${respuesta}`);

      assert.ok(!respuesta.includes('password_hash'), 'No debe exponerse password_hash');
      assert.ok(!respuesta.includes('$2b$'), 'No debe exponerse el hash de bcrypt');
      assert.ok(!respuesta.includes(password), 'No debe devolverse la contrasena en texto plano');
    });
  });
});
