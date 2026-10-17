
const AuditLog = require("../models/AuditLog");

// ─── GET AUDIT LOGS (admin only) ──────────────────────────────────────────────
const getAuditLogs = async (req, res) => {
  try {
    const { targetType, performedBy, action, department, startDate, endDate } =
      req.query;

    const filter = {};

    if (targetType) filter.targetType = targetType;
    if (performedBy) filter.performedBy = performedBy;
    if (action) filter.action = action;
    if (department) filter.department = department;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(filter)
      .populate("performedBy", "name email role")
      .populate("department", "name code")
      .sort({ createdAt: -1 })
      .limit(200);

    return res.json({ count: logs.length, logs });
  } catch (error) {
    console.error("getAuditLogs error:", error.message);
    return res.status(500).json({ message: "Server error while fetching audit logs" });
  }
};

module.exports = { getAuditLogs };
