const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  getCaseAnalytics,
  getCaseTimeline,
  syncCasesFromEvidence
} = require('../controllers/caseController');

router.use(protect);

router.get('/', getCases);
router.get('/:id', getCaseById);
router.get('/:id/analytics', getCaseAnalytics);
router.get('/:id/timeline', getCaseTimeline);

router.post('/', authorize('admin', 'forensic', 'police'), createCase);
router.post('/sync', authorize('admin', 'forensic', 'police'), syncCasesFromEvidence);
router.put('/:id', authorize('admin', 'forensic', 'police'), updateCase);
router.delete('/:id', authorize('admin'), deleteCase);

module.exports = router;
