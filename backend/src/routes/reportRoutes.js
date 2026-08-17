const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const requireAuth = require('../middleware/requireAuth');
const {
  listReports,
  createReport,
  updateReport,
  deleteReport,
  completeReport,
  getMeta,
} = require('../controllers/reportController');

const router = Router();

// Todas las rutas de reportes exigen sesión activa. Aplicarlo a nivel del
// router (y no ruta por ruta) evita el error clásico de agregar un endpoint
// nuevo y olvidar protegerlo. Esta línea es también lo que le da efecto real
// al cierre de sesión de HU3: sin token, nada de esto responde.
router.use(requireAuth);

router.get('/meta', asyncHandler(getMeta));

router.get('/', asyncHandler(listReports));
router.post('/', asyncHandler(createReport));
router.put('/:id', asyncHandler(updateReport));
router.delete('/:id', asyncHandler(deleteReport));
router.patch('/:id/complete', asyncHandler(completeReport));

module.exports = router;
