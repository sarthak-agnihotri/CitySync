const Conflict = require("../models/Conflict");
const Project = require("../models/Project");
const { checkConflictsDraft } = require("../utils/conflictDetector");
const { logAudit, createNotification } = require("../utils/notifyAudit");
const User = require("../models/User");

// ─── GET ALL CONFLICTS ────────────────────────────────────────────────────────
const getConflicts = async (req, res) => {
  try {
    const { status, severity, conflictType, department } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (conflictType) filter.conflictType = conflictType;

    // Officers can see only conflicts involving their department
    if (req.user.role === "officer") {
      if (!req.user.department) {
        return res.status(403).json({
          message: "You are not assigned to any department"
        });
      }

      filter.departmentsInvolved = req.user.department;
    } else if (department) {
      filter.departmentsInvolved = department;
    }

    const conflicts = await Conflict.find(filter)
      .populate("projectA", "title category status startDate endDate coordinates zone address")
      .populate("projectB", "title category status startDate endDate coordinates zone address")
      .populate("departmentsInvolved", "name code")
      .populate("resolvedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.json({
      count: conflicts.length,
      conflicts
    });
  } catch (error) {
    console.error("getConflicts error:", error.message);
    return res.status(500).json({
      message: "Server error while fetching conflicts"
    });
  }
};

// ─── GET CONFLICT BY ID ───────────────────────────────────────────────────────
const getConflictById = async (req, res) => {
  try {
    const conflict = await Conflict.findById(req.params.id)
      .populate({
        path: "projectA",
        populate: { path: "department", select: "name code contactEmail" }
      })
      .populate({
        path: "projectB",
        populate: { path: "department", select: "name code contactEmail" }
      })
      .populate("departmentsInvolved", "name code contactEmail")
      .populate("resolvedBy", "name email role");

    if (!conflict) {
      return res.status(404).json({ message: "Conflict not found" });
    }

    // Officers can access only conflicts involving their department
    if (req.user.role === "officer") {
      if (!req.user.department) {
        return res.status(403).json({
          message: "You are not assigned to any department"
        });
      }

      const isInvolved = conflict.departmentsInvolved.some(
  (dept) =>
    dept._id.toString() === req.user.department.toString()
);

      if (!isInvolved) {
        return res.status(403).json({
          message: "You do not have permission to access this conflict"
        });
      }
    }

    return res.json({ conflict });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid conflict ID" });
    }

    console.error("getConflictById error:", error.message);
    return res.status(500).json({
      message: "Server error while fetching conflict"
    });
  }
};

// ─── CHECK DRAFT CONFLICTS (SIMULATION) ──────────────────────────────────────
const checkDraft = async (req, res) => {
  try {
    const { startDate, endDate, coordinates, zone, excludeProjectId } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate and endDate are required for conflict simulation"
      });
    }

    const potentialConflicts = await checkConflictsDraft(
  { startDate, endDate, coordinates, zone },
  excludeProjectId,
  req.user.role === "officer" ? req.user.department : null
);

    return res.json({
      count: potentialConflicts.length,
      hasConflicts: potentialConflicts.length > 0,
      potentialConflicts
    });
  } catch (error) {
    console.error("checkDraft error:", error.message);
    return res.status(500).json({ message: "Server error while checking draft conflicts" });
  }
};

// ─── RESOLVE CONFLICT ─────────────────────────────────────────────────────────
const resolveConflict = async (req, res) => {
  try {
    const { resolutionNotes, status } = req.body;

    const allowedStatuses = ["resolved", "ignored"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid conflict status"
      });
    }

    const conflict = await Conflict.findById(req.params.id)
      .populate("projectA", "title department")
      .populate("projectB", "title department");

    if (!conflict) {
      return res.status(404).json({
        message: "Conflict not found"
      });
    }

    const previousState = conflict.toObject();

    conflict.status = status || "resolved";
    conflict.resolutionNotes =
      resolutionNotes || "Resolved via inter-departmental consensus";

    conflict.resolvedBy = req.user.userId;
    conflict.resolvedAt = new Date();

    await conflict.save();

    // Notify all department heads, including the central head
    try {
      const deptHeads = await User.find({
        role: "department_head"
      }).select("_id");

      for (const head of deptHeads) {
        await createNotification({
          recipient: head._id,
          type: "conflict_resolved",
          title: "Conflict Resolved",
          message: `The conflict between "${conflict.projectA?.title}" and "${conflict.projectB?.title}" has been marked as ${conflict.status}. Notes: ${conflict.resolutionNotes}`,
          relatedProject: conflict.projectA?._id
        });
      }
    } catch (notifErr) {
      console.error(
        "resolveConflict notification error:",
        notifErr.message
      );
    }

    await logAudit({
      action: "CONFLICT_RESOLVED",
      performedBy: req.user.userId,
      targetType: "Conflict",
      targetId: conflict._id,
      description: `Conflict resolved with status "${conflict.status}". Notes: ${conflict.resolutionNotes}`,
      previousState,
      newState: conflict.toObject(),
      ipAddress: req.ip
    });

    return res.json({
      message: "Conflict resolved successfully",
      conflict
    });

  } catch (error) {
    console.error("resolveConflict error:", error.message);

    return res.status(500).json({
      message: "Server error while resolving conflict"
    });
  }
};

module.exports = {
  getConflicts,
  getConflictById,
  checkDraft,
  resolveConflict
};
