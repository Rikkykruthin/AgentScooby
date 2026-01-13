const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateEvidenceReport,
  generateCustodyCertificate,
  generateCaseReport
} = require('../controllers/reportController');

    // All routes are protected
router.use(protect);

// Evidence Reports
router.get('/evidence/:id', generateEvidenceReport);
router.get('/custody/:id', generateCustodyCertificate);

// Case Reports
router.get('/case/:id', generateCaseReport);

module.exports = router;
