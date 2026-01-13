const mongoose = require('mongoose');

// Stores the current Merkle root for integrity verification
const merkleRootSchema = new mongoose.Schema({
  root: {
    type: String,
    required: true
  },
  evidenceCount: {
    type: Number,
    required: true
  },
  computedAt: {
    type: Date,
    default: Date.now
  },
  // Previous root for chain
  previousRoot: {
    type: String,
    default: 'GENESIS'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MerkleRoot', merkleRootSchema);
