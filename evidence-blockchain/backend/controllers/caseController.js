const Case = require('../models/Case');
const Evidence = require('../models/Evidence');
const MovementLog = require('../models/MovementLog');
const AccessLog = require('../models/AccessLog');
const { createAuditLog } = require('../utils/auditLogger');

exports.syncCasesFromEvidence = async (req, res) => {
  try {
    const uniqueCaseNos = await Evidence.distinct('caseNo');
    
    let created = 0;
    let skipped = 0;

    for (const caseNo of uniqueCaseNos) {
      if (!caseNo) continue;
      
      // Check if case already exists
      const existingCase = await Case.findOne({ caseNo });
      if (existingCase) {
        skipped++;
        continue;
      }

      // Get first evidence with this caseNo to get some details
      const sampleEvidence = await Evidence.findOne({ caseNo })
        .populate('collectedBy', 'name');

      // Create case
      await Case.create({
        caseNo,
        title: `Case ${caseNo}`,
        description: `Auto-generated case for evidence with case number ${caseNo}`,
        type: 'Other',
        status: 'Open',
        priority: 'Medium',
        createdBy: sampleEvidence?.collectedBy?._id || req.user._id,
        assignedOfficer: sampleEvidence?.collectedBy?._id || req.user._id
      });
      created++;
    }

    res.json({
      message: `Sync complete. Created ${created} cases, skipped ${skipped} existing.`,
      created,
      skipped
    });
  } catch (error) {
    console.error('Sync cases error:', error);
    res.status(500).json({ message: 'Error syncing cases' });
  }
};

exports.getCases = async (req, res) => {
  try {
    const { search, status, priority } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { caseNo: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { caseId: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const cases = await Case.find(query)
      .populate('assignedOfficer', 'name designation')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    const casesWithCount = await Promise.all(
      cases.map(async (c) => {
        const evidenceCount = await Evidence.countDocuments({ caseNo: c.caseNo });
        return {
          ...c.toObject(),
          evidenceCount
        };
      })
    );

    res.json(casesWithCount);
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({ message: 'Error fetching cases' });
  }
};

exports.getCaseById = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('assignedOfficer', 'name designation email')
      .populate('createdBy', 'name designation');

    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Get lin
    const evidence = await Evidence.find({ caseNo: caseData.caseNo })
      .populate('collectedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      ...caseData.toObject(),
      evidence,
      evidenceCount: evidence.length
    });
  } catch (error) {
    console.error('Get case error:', error);
    res.status(500).json({ message: 'Error fetching case' });
  }
};

// Create case
exports.createCase = async (req, res) => {
  try {
    const { caseNo, title, description, type, status, priority, assignedOfficer, location, notes, filingDate } = req.body;

    // Check if case number already exists
    const existingCase = await Case.findOne({ caseNo });
    if (existingCase) {
      return res.status(400).json({ message: 'Case number already exists' });
    }

    const newCase = await Case.create({
      caseNo,
      title,
      description,
      type,
      status,
      priority,
      assignedOfficer: assignedOfficer || req.user._id,
      createdBy: req.user._id,
      location,
      notes,
      filingDate: filingDate || Date.now()
    });

    await createAuditLog({
      action: 'CASE_CREATED',
      actor: req.user._id,
      targetType: 'Case',
      targetId: newCase._id,
      targetName: newCase.caseId,
      details: `Case ${newCase.caseId} created: ${title}`,
      req
    });

    res.status(201).json(newCase);
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({ message: error.message || 'Error creating case' });
  }
};

// Update case
exports.updateCase = async (req, res) => {
  try {
    const { title, description, type, status, priority, assignedOfficer, location, notes, closedDate } = req.body;

    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const oldStatus = caseData.status;

    caseData.title = title || caseData.title;
    caseData.description = description || caseData.description;
    caseData.type = type || caseData.type;
    caseData.status = status || caseData.status;
    caseData.priority = priority || caseData.priority;
    caseData.assignedOfficer = assignedOfficer || caseData.assignedOfficer;
    caseData.location = location || caseData.location;
    caseData.notes = notes !== undefined ? notes : caseData.notes;

    if (status === 'Closed' && oldStatus !== 'Closed') {
      caseData.closedDate = closedDate || Date.now();
    }

    await caseData.save();

    await createAuditLog({
      action: 'CASE_UPDATED',
      actor: req.user._id,
      targetType: 'Case',
      targetId: caseData._id,
      targetName: caseData.caseId,
      details: `Case ${caseData.caseId} updated${status !== oldStatus ? `. Status: ${oldStatus} → ${status}` : ''}`,
      req
    });

    res.json(caseData);
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({ message: 'Error updating case' });
  }
};

// Delete case
exports.deleteCase = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Check if there's evidence linked to this case
    const evidenceCount = await Evidence.countDocuments({ caseNo: caseData.caseNo });
    if (evidenceCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete case. ${evidenceCount} evidence item(s) are linked to this case.` 
      });
    }

    await Case.findByIdAndDelete(req.params.id);

    await createAuditLog({
      action: 'CASE_DELETED',
      actor: req.user._id,
      targetType: 'Case',
      targetId: caseData._id,
      targetName: caseData.caseId,
      details: `Case ${caseData.caseId} (${caseData.caseNo}) deleted`,
      req
    });

    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({ message: 'Error deleting case' });
  }
};

// Get case analytics
exports.getCaseAnalytics = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Get all evidence for this case
    const evidence = await Evidence.find({ caseNo: caseData.caseNo });
    const evidenceIds = evidence.map(e => e._id);

    // Evidence by type
    const evidenceByType = await Evidence.aggregate([
      { $match: { caseNo: caseData.caseNo } },
      { $group: { _id: '$evidenceType', count: { $sum: 1 } } }
    ]);

    // Evidence by status
    const evidenceByStatus = await Evidence.aggregate([
      { $match: { caseNo: caseData.caseNo } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Movement logs count
    const movementCount = await MovementLog.countDocuments({ evidenceId: { $in: evidenceIds } });

    // Access logs count
    const accessCount = await AccessLog.countDocuments({ evidenceId: { $in: evidenceIds } });

    // Case duration
    const duration = caseData.closedDate 
      ? Math.ceil((new Date(caseData.closedDate) - new Date(caseData.filingDate)) / (1000 * 60 * 60 * 24))
      : Math.ceil((new Date() - new Date(caseData.filingDate)) / (1000 * 60 * 60 * 24));

    res.json({
      caseId: caseData.caseId,
      caseNo: caseData.caseNo,
      status: caseData.status,
      totalEvidence: evidence.length,
      evidenceByType,
      evidenceByStatus,
      movementCount,
      accessCount,
      durationDays: duration,
      filingDate: caseData.filingDate,
      closedDate: caseData.closedDate
    });
  } catch (error) {
    console.error('Case analytics error:', error);
    res.status(500).json({ message: 'Error fetching case analytics' });
  }
};

// Get case timeline
exports.getCaseTimeline = async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const timeline = [];

    // Case created event
    timeline.push({
      type: 'case_created',
      date: caseData.createdAt,
      title: 'Case Filed',
      description: `Case ${caseData.caseNo} was created`,
      icon: 'folder'
    });

    // Get all evidence for this case
    const evidence = await Evidence.find({ caseNo: caseData.caseNo })
      .populate('collectedBy', 'name');

    // Evidence added events
    evidence.forEach(ev => {
      timeline.push({
        type: 'evidence_added',
        date: ev.createdAt,
        title: 'Evidence Added',
        description: `${ev.name} (${ev.evidenceId}) added to case`,
        evidenceId: ev._id,
        icon: 'document'
      });
    });

    const evidenceIds = evidence.map(e => e._id);

    // Movement events
    const movements = await MovementLog.find({ evidenceId: { $in: evidenceIds } })
      .populate('movedBy', 'name')
      .populate('evidenceId', 'evidenceId name');

    movements.forEach(m => {
      timeline.push({
        type: 'evidence_moved',
        date: m.createdAt,
        title: 'Evidence Moved',
        description: `${m.evidenceId?.name} moved from ${m.fromLocation} to ${m.toLocation}`,
        icon: 'truck'
      });
    });

    // Case closed event
    if (caseData.closedDate) {
      timeline.push({
        type: 'case_closed',
        date: caseData.closedDate,
        title: 'Case Closed',
        description: `Case ${caseData.caseNo} was closed`,
        icon: 'check'
      });
    }

    // Sort by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(timeline);
  } catch (error) {
    console.error('Case timeline error:', error);
    res.status(500).json({ message: 'Error fetching case timeline' });
  }
};
