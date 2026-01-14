const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    unique: true
  },
  caseNo: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Criminal', 'Civil', 'Fraud', 'Theft', 'Assault', 'Homicide', 'Cybercrime', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['Open', 'Under Investigation', 'Pending Trial', 'Closed', 'Archived'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filingDate: {
    type: Date,
    default: Date.now
  },
  closedDate: {
    type: Date
  },
  location: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

caseSchema.pre('save', async function(next) {
  if (!this.caseId) {
    const count = await mongoose.model('Case').countDocuments();
    this.caseId = `CASE${(1001 + count).toString()}`;
  }
  next();
});

module.exports = mongoose.model('Case', caseSchema);
