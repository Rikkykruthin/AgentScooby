const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updatePassword,
  getUsers
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/password', protect, updatePassword);
router.get('/users', protect, getUsers);

module.exports = router;
