const express = require('express');
const router = express.Router();
const {
  getAuditLogs,
  getAuditStats,
  getTargetAuditLogs
} = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

// All audit routes require authentication
router.get('/', protect, getAuditLogs);
router.get('/stats', protect, getAuditStats);
router.get('/target/:targetId', protect, getTargetAuditLogs);

module.exports = router;
