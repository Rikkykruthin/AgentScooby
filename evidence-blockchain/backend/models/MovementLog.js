const mongoose = require('mongoose');

const movementLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    unique: true
  },
  evidence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidence',
    required: true
  },
  caseNo: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  officerIncharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Evidence Departed', 'In Transit', 'Evidence Arrived'],
    default: 'Evidence Departed'
  },
  purpose: {
    type: String
  },
  // Blockchain fields
  currentHash: {
    type: String,
    required: true
  },
  previousHash: {
    type: String,
    default: 'GENESIS'
  },
  // Digital signature
  signature: {
    type: String,
    required: true
  },
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate log ID
movementLogSchema.pre('save', async function(next) {
  if (!this.logId) {
    const count = await mongoose.model('MovementLog').countDocuments();
    this.logId = `ML${(10001 + count).toString()}`;
  }
  next();
});

module.exports = mongoose.model('MovementLog', movementLogSchema);
