const express = require('express');
const router = express.Router();
const {
  createMovementLog,
  getMovementLogs,
  updateMovementStatus,
  createAccessLog,
  officerExit,
  getAccessLogs,
  getMyLogs
} = require('../controllers/logController');
const { protect, authorize } = require('../middleware/auth');

router.route('/movement')
  .get(protect, getMovementLogs)
  .post(protect, authorize('admin', 'forensic', 'staff', 'police'), createMovementLog);

router.put('/movement/:id', protect, updateMovementStatus);

router.route('/access')
  .get(protect, getAccessLogs)
  .post(protect, createAccessLog);

router.put('/access/:id/exit', protect, officerExit);

router.get('/my-logs', protect, getMyLogs);

module.exports = router;
