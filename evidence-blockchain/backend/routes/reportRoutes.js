const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateEvidenceReport,
  generateCustodyCertificate,
  generateCaseReport
} = require('../controllers/reportController');

router.use(protect);

router.get('/evidence/:id', generateEvidenceReport);
router.get('/custody/:id', generateCustodyCertificate);

router.get('/case/:id', generateCaseReport);

module.exports = router;
