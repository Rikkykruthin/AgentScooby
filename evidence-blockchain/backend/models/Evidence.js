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
  evidenceType: {
    type: String,
    enum: ['Digital', 'Physical', 'Biological', 'Documentary', 'Weapon', 'Drug', 'Financial', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
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
  storageLocation: {
    type: String,
    required: true
  },
  storagePointer: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Collected', 'In Storage', 'In Transit', 'Under Analysis', 'In Court', 'Disposed'],
    default: 'Collected'
  },
  attachments: [{
    fileName: String,
    fileHash: String,
    fileSize: Number,
    mimeType: String,
    filePath: String,
    uploadedAt: Date
  }],
  currentHash: {
    type: String,
    required: true
  },
  previousHash: {
    type: String,
    default: 'GENESIS'
  },
  signature: {
    type: String,
    required: true
  },
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  merkleProof: [{
    position: String,
    data: String
  }],
  signedTimestamp: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});
evidenceSchema.pre('save', async function(next) {
  if (!this.evidenceId) {
    const count = await mongoose.model('Evidence').countDocuments();
    this.evidenceId = `EV${(1001 + count).toString()}`;
  }
  next();
});

module.exports = mongoose.model('Evidence', evidenceSchema);
