const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {
    const {
      action,
      actor,
      targetType,
      startDate,
      endDate,
      status,
      search,
      page = 1,
      limit = 50
    } = req.query;

    let query = {};

    if (action) {
      query.action = action;
    }

    if (actor) {
      query.actor = actor;
    }

    if (targetType) {
      query.targetType = targetType;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    if (search) {
      query.$or = [
        { targetName: { $regex: search, $options: 'i' } },
        { 'details.caseNo': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments(query);

    const logs = await AuditLog.find(query)
      .populate('actor', 'name email role designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get Audit Logs Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Action counts
    const actionCounts = await AuditLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // User activity (top 10)
    const userActivity = await AuditLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$actor',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          role: '$user.role',
          count: 1
        }
      }
    ]);

    // Status distribution
    const statusCounts = await AuditLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Activity over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyActivity = await AuditLog.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent critical actions
    const criticalActions = await AuditLog.find({
      action: {
        $in: ['EVIDENCE_DELETED', 'USER_CREATED', 'EVIDENCE_UPDATED']
      }
    })
      .populate('actor', 'name role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      actionCounts,
      userActivity,
      statusCounts,
      dailyActivity,
      criticalActions,
      totalLogs: await AuditLog.countDocuments(dateFilter)
    });

  } catch (error) {
    console.error('Get Audit Stats Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logs for specific target
// @route   GET /api/audit/target/:targetId
const getTargetAuditLogs = async (req, res) => {
  try {
    const { targetId } = req.params;

    const logs = await AuditLog.find({ targetId })
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 });

    res.json(logs);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAuditLogs,
  getAuditStats,
  getTargetAuditLogs
};
