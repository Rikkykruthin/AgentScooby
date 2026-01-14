const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateKeyPair } = require('../utils/digitalSignature');
const { createAuditLog } = require('../utils/auditLogger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'evidence_secret_key', {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, contact, role, designation } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // key pair for digital signatures
    const { privateKey, publicKey } = generateKeyPair();

    const user = await User.create({
      name,
      email,
      password,
      contact,
      role,
      designation,
      publicKey,
      privateKey
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        publicKey: user.publicKey,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });

    if (user && (await user.matchPassword(password))) {
      await createAuditLog({
        action: 'LOGIN',
        actor: user._id,
        targetType: 'System',
        details: { role: user.role },
        req,
        status: 'SUCCESS'
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        publicKey: user.publicKey,
        token: generateToken(user._id)
      });
    } else {
      if (user) {
        await createAuditLog({
          action: 'LOGIN',
          actor: user._id,
          targetType: 'System',
          details: { role },
          req,
          status: 'FAILED',
          errorMessage: 'Invalid password'
        });
      }
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -privateKey');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { currentPassword, newPassword } = req.body;

    if (await user.matchPassword(currentPassword)) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(400).json({ message: 'Current password is incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password -privateKey');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updatePassword,
  getUsers
};
