const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 */
const createAuditLog = async ({
  action,
  actor,
  targetType,
  targetId,
  targetName,
  details,
  req,
  status = 'SUCCESS',
  errorMessage
}) => {
  try {
    await AuditLog.create({
      action,
      actor,
      targetType,
      targetId,
      targetName,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers['user-agent'],
      status,
      errorMessage
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

module.exports = { createAuditLog };
