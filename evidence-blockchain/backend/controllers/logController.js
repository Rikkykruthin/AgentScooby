const MovementLog = require('../models/MovementLog');
const AccessLog = require('../models/AccessLog');
const Evidence = require('../models/Evidence');
const User = require('../models/User');
const { signData, hashData } = require('../utils/digitalSignature');


const getPreviousMovementHash = async () => {
  const lastLog = await MovementLog.findOne().sort({ createdAt: -1 });
  return lastLog ? lastLog.currentHash : 'GENESIS';
};

const createMovementLog = async (req, res) => {
  try {
    const { evidenceId, caseNo, source, destination, purpose } = req.body;

    const evidence = await Evidence.findById(evidenceId);
    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    const user = await User.findById(req.user._id);

    const dataString = JSON.stringify({
      evidenceId, caseNo, source, destination, purpose,
      timestamp: Date.now()
    });

    const previousHash = await getPreviousMovementHash();
    const currentHash = hashData(dataString + previousHash);

    const signature = signData(dataString, user.privateKey);

    const log = await MovementLog.create({
      evidence: evidenceId,
      caseNo,
      source,
      destination,
      officerIncharge: req.user._id,
      purpose,
      status: 'Evidence Departed',
      currentHash,
      previousHash,
      signature,
      signedBy: req.user._id
    });

    evidence.status = 'In Transit';
    await evidence.save();

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMovementLogs = async (req, res) => {
  try {
    const { caseNo } = req.query;
    let query = {};

    if (caseNo) {
      query.caseNo = caseNo;
    }

    const logs = await MovementLog.find(query)
      .populate('evidence', 'name evidenceId')
      .populate('officerIncharge', 'name designation')
      .populate('signedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMovementStatus = async (req, res) => {
  try {
    const log = await MovementLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Movement log not found' });
    }

    log.status = req.body.status || 'Evidence Arrived';
    await log.save();

    if (req.body.status === 'Evidence Arrived') {
      const evidence = await Evidence.findById(log.evidence);
      if (evidence) {
        evidence.status = 'In Storage';
        await evidence.save();
      }
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAccessLog = async (req, res) => {
  try {
    const { evidenceId, caseNo, purpose, count } = req.body;

    const log = await AccessLog.create({
      evidence: evidenceId || null,
      caseNo,
      officer: req.user._id,
      department: req.user.role,
      designation: req.user.designation,
      purpose,
      count: count || 0,
      entryTime: new Date(),
      status: 'Officer Entered'
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const officerExit = async (req, res) => {
  try {
    const log = await AccessLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Access log not found' });
    }

    log.exitTime = new Date();
    log.status = 'Officer Exited';
    await log.save();

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAccessLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find()
      .populate('evidence', 'name evidenceId')
      .populate('officer', 'name designation')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyLogs = async (req, res) => {
  try {
    const accessLogs = await AccessLog.find({ officer: req.user._id })
      .populate('evidence', 'name evidenceId')
      .sort({ createdAt: -1 });

    const movementLogs = await MovementLog.find({ officerIncharge: req.user._id })
      .populate('evidence', 'name evidenceId')
      .sort({ createdAt: -1 });

    res.json({ accessLogs, movementLogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMovementLog,
  getMovementLogs,
  updateMovementStatus,
  createAccessLog,
  officerExit,
  getAccessLogs,
  getMyLogs
};
