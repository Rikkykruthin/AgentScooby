const mongoose = require('mongoose');

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
  previousRoot: {
    type: String,
    default: 'GENESIS'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MerkleRoot', merkleRootSchema);
