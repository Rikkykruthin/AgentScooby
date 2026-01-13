const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'EVIDENCE_CREATED',
      'EVIDENCE_UPDATED',
      'EVIDENCE_DELETED',
      'EVIDENCE_VERIFIED',
      'MOVEMENT_LOG_CREATED',
      'MOVEMENT_STATUS_UPDATED',
      'ACCESS_LOG_CREATED',
      'ACCESS_LOG_EXIT',
      'USER_CREATED',
      'PASSWORD_CHANGED',
      'CASE_CREATED',
      'CASE_UPDATED',
      'CASE_DELETED'
    ]
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['Evidence', 'MovementLog', 'AccessLog', 'User', 'System', 'Case']
  },
  targetId: {
    type: String
  },
  targetName: {
    type: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    default: 'SUCCESS'
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
