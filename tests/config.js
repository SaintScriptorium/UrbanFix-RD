// Configuracion central de las pruebas. Todo lo que pueda cambiar entre
// maquinas (puertos, modo headless, tiempos de espera) vive aqui y no
// disperso en los archivos de prueba.
module.exports = {
  // URL donde corre el frontend (Vite).
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',

  // URL del backend. Solo se usa para verificar que la API este arriba
  // antes de empezar, no para probar endpoints directamente.
  apiUrl: process.env.API_URL || 'http://localhost:4000',

  // HEADLESS=true corre Chrome sin ventana visible (util para CI).
  // Por defecto es false para que puedas VER las pruebas ejecutandose,
  // que es justamente lo que necesitas grabar para el video.
  headless: process.env.HEADLESS === 'true',

  // Espera maxima por defecto para que un elemento aparezca en pantalla.
  timeout: 15000,

  // Limite del requerimiento no funcional: el feed debe cargar en menos
  // de 3 segundos (RNF-02).
  feedLoadLimitMs: 3000,

  // Resoluciones usadas en las pruebas de interfaz responsiva (HU11).
  viewports: {
    mobile: { width: 375, height: 812 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1440, height: 900 },
  },

  // Usuario fijo que se crea una sola vez y se reutiliza en las pruebas
  // que solo necesitan una sesion valida.
  seedUser: {
    fullName: 'Rosanna Feliz QA',
    email: 'qa.urbanfix@test.do',
    password: 'Pruebas2026',
  },
};
