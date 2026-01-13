const Evidence = require('../models/Evidence');
const MovementLog = require('../models/MovementLog');
const AccessLog = require('../models/AccessLog');

// @desc    Get chain of custody for an evidence
// @route   GET /api/chain-of-custody/:evidenceId
const getChainOfCustody = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    // Get evidence
    const evidence = await Evidence.findById(evidenceId)
      .populate('collectedBy', 'name role designation')
      .populate('signedBy', 'name role');

    if (!evidence) {
      return res.status(404).json({ message: 'Evidence not found' });
    }

    // Build timeline events
    const timeline = [];

    // 1. Evidence Collection Event
    timeline.push({
      type: 'COLLECTION',
      timestamp: evidence.collectionDate || evidence.createdAt,
      actor: evidence.collectedBy,
      details: {
        action: 'Evidence Collected',
        location: evidence.collectionLocation,
        evidenceName: evidence.name,
        evidenceType: evidence.evidenceType,
        caseNo: evidence.caseNo
      },
      blockchainData: {
        hash: evidence.currentHash,
        signature: evidence.signature?.substring(0, 32) + '...'
      }
    });

    // 2. Get all movement logs for this evidence
    const movements = await MovementLog.find({ evidence: evidenceId })
      .populate('officerIncharge', 'name role designation')
      .populate('signedBy', 'name')
      .sort({ createdAt: 1 });

    movements.forEach(movement => {
      timeline.push({
        type: 'MOVEMENT',
        timestamp: movement.createdAt,
        actor: movement.officerIncharge,
        details: {
          action: 'Evidence Moved',
          from: movement.source,
          to: movement.destination,
          status: movement.status,
          purpose: movement.purpose,
          caseNo: movement.caseNo
        },
        blockchainData: {
          hash: movement.currentHash,
          previousHash: movement.previousHash,
          signature: movement.signature?.substring(0, 32) + '...'
        }
      });
    });

    // 3. Get all access logs for this evidence
    const accesses = await AccessLog.find({ evidence: evidenceId })
      .populate('officer', 'name role designation')
      .sort({ createdAt: 1 });

    accesses.forEach(access => {
      timeline.push({
        type: 'ACCESS',
        timestamp: access.entryTime,
        actor: access.officer,
        details: {
          action: access.status === 'Officer Exited' ? 'Officer Exited' : 'Officer Entry',
          purpose: access.purpose,
          duration: access.exitTime 
            ? Math.round((new Date(access.exitTime) - new Date(access.entryTime)) / 60000) + ' minutes'
            : 'In progress',
          department: access.department,
          designation: access.designation
        }
      });

      // Add exit event if exists
      if (access.exitTime) {
        timeline.push({
          type: 'ACCESS_EXIT',
          timestamp: access.exitTime,
          actor: access.officer,
          details: {
            action: 'Officer Exit',
            purpose: access.purpose,
            department: access.department
          }
        });
      }
    });

    // 4. Check for modifications (by comparing with original)
    // If evidence has been updated, there will be a new signature
    if (evidence.previousHash && evidence.previousHash !== 'GENESIS') {
      timeline.push({
        type: 'MODIFICATION',
        timestamp: evidence.updatedAt,
        actor: evidence.signedBy,
        details: {
          action: 'Evidence Modified',
          status: evidence.status
        },
        blockchainData: {
          currentHash: evidence.currentHash,
          previousHash: evidence.previousHash
        }
      });
    }

    // Sort timeline by timestamp
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Add sequence numbers
    timeline.forEach((event, index) => {
      event.sequence = index + 1;
    });

    res.json({
      evidenceId: evidence.evidenceId,
      evidenceName: evidence.name,
      caseNo: evidence.caseNo,
      currentStatus: evidence.status,
      currentLocation: evidence.storageLocation,
      timeline: timeline,
      summary: {
        totalEvents: timeline.length,
        collectionsCount: timeline.filter(e => e.type === 'COLLECTION').length,
        movementsCount: timeline.filter(e => e.type === 'MOVEMENT').length,
        accessesCount: timeline.filter(e => e.type === 'ACCESS').length,
        modificationsCount: timeline.filter(e => e.type === 'MODIFICATION').length
      }
    });

  } catch (error) {
    console.error('Chain of Custody Error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChainOfCustody
};
