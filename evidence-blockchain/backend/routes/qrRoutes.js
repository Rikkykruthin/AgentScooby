const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  generateQRCode,
  generatePrintableQR,
  getEvidenceByQR
} = require('../controllers/qrController');

router.get('/generate/:id', protect, generateQRCode);
router.get('/printable/:id', protect, generatePrintableQR);

router.get('/scan/:id', getEvidenceByQR);

module.exports = router;
