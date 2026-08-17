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


router.use(requireAuth);

router.get('/meta', asyncHandler(getMeta));

router.get('/', asyncHandler(listReports));
router.post('/', asyncHandler(createReport));
router.put('/:id', asyncHandler(updateReport));
router.delete('/:id', asyncHandler(deleteReport));
router.patch('/:id/complete', asyncHandler(completeReport));

module.exports = router;
