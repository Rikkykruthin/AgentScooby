const express = require('express');
const router = express.Router();
const {
  addEvidence,
  getAllEvidence,
  getEvidence,
  updateEvidence,
  deleteEvidence,
  verifyEvidence,
  getMerkleRoot,
  downloadFile
} = require('../controllers/evidenceController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/merkle/root', protect, getMerkleRoot);
router.get('/:id/verify', protect, verifyEvidence);
router.get('/:id/download/:fileId', protect, downloadFile);

router.route('/')
  .get(protect, getAllEvidence)
  .post(protect, authorize('admin', 'forensic', 'police'), upload.array('files', 10), addEvidence);

router.route('/:id')
  .get(protect, getEvidence)
  .put(protect, authorize('admin', 'forensic'), updateEvidence)
  .delete(protect, authorize('admin'), deleteEvidence);

module.exports = router;
