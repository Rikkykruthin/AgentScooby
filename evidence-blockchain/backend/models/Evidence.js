const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  evidenceId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  caseNo: {
    type: String,
    required: true,
    index: true
  },
  // Evidence Type (Digital, Physical, Biological, etc.)
  evidenceType: {
    type: String,
    enum: ['Digital', 'Physical', 'Biological', 'Documentary', 'Weapon', 'Drug', 'Financial', 'Other'],
    required: true
  },
  // Detailed description
  description: {
    type: String,
    required: true
  },
  // Collection details
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collectionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  collectionLocation: {
    type: String,
    required: true
  },
  // Storage information
  storageLocation: {
    type: String,
    required: true
  },
  storagePointer: {
    type: String,  // IPFS hash, S3 URL, or physical location code
    required: true
  },
  // Chain of custody
  status: {
    type: String,
    enum: ['Collected', 'In Storage', 'In Transit', 'Under Analysis', 'In Court', 'Disposed'],
    default: 'Collected'
  },
  // File/media attachments
  attachments: [{
    fileName: String,
    fileHash: String,  // SHA-256 hash of the file
    fileSize: Number,
    mimeType: String,
    filePath: String,  // Server filename
    uploadedAt: Date
  }],
  // Blockchain fields
  currentHash: {
    type: String,
    required: true
  },
  previousHash: {
    type: String,
    default: 'GENESIS'
  },
  // Digital signature of the officer who added/modified
  signature: {
    type: String,
    required: true
  },
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Merkle proof (updated when tree is rebuilt)
  merkleProof: [{
    position: String,
    data: String
  }],
  // Timestamp used for signing (must match for verification)
  signedTimestamp: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Generate evidence ID
evidenceSchema.pre('save', async function(next) {
  if (!this.evidenceId) {
    const count = await mongoose.model('Evidence').countDocuments();
    this.evidenceId = `EV${(1001 + count).toString()}`;
  }
  next();
});

module.exports = mongoose.model('Evidence', evidenceSchema);
