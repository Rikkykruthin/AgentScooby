const express = require('express');
const router = express.Router();
const { getChainOfCustody } = require('../controllers/chainOfCustodyController');
const { protect } = require('../middleware/auth');

router.get('/:evidenceId', protect, getChainOfCustody);

module.exports = router;
