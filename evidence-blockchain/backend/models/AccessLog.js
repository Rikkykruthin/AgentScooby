const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    unique: true
  },
  evidence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evidence'
  },
  caseNo: {
    type: String
  },
  officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  officerIncharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String
  },
  purpose: {
    type: String,
    enum: ['To Store Evidence', 'To Take Evidence', 'For Analysis', 'For Court', 'Inspection'],
    required: true
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Officer Entered', 'Officer Exited'],
    default: 'Officer Entered'
  },
  count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

accessLogSchema.pre('save', async function(next) {
  if (!this.logId) {
    const count = await mongoose.model('AccessLog').countDocuments();
    this.logId = `AL${(10001 + count).toString()}`;
  }
  next();
});

module.exports = mongoose.model('AccessLog', accessLogSchema);
