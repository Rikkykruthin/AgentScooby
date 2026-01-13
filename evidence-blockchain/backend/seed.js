const mongoose = require('mongoose');
const User = require('./models/User');
const { generateKeyPair } = require('./utils/digitalSignature');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/evidence_blockchain';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Generate key pair for admin
    const { privateKey, publicKey } = generateKeyPair();

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@custain.com',
      password: 'admin123',
      contact: '9999999999',
      role: 'admin',
      designation: 'System Administrator',
      publicKey,
      privateKey
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@custain.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
