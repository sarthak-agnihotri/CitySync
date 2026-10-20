const Project = require("../models/Project");
const Conflict = require("../models/Conflict");
const { detectAndRecordConflicts } = require("../utils/conflictDetector");
const { logAudit, createNotification } = require("../utils/notifyAudit");
const User = require("../models/User");

// ─── CREATE PROJECT ──────────────────────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    let {
      title,
      description,
      department,
      category,
      zone,
      address,
      coordinates,
      startDate,
      endDate,
      estimatedBudget,
      priority
    } = req.body;

    // Check department authorization for department_head
    if (req.user.role === "department_head") {
      if (!department && req.user.department) {
        department = req.user.department;
      } else if (
        department &&
        req.user.department &&
        department.toString() !== req.user.department.toString()
      ) {
        return res.status(403).json({
          message: "Department heads can only create projects for their own department"
        });
      }
    }

    if (!department && req.user.department) {
      department = req.user.department;
    }

    if (
      !title ||
      !department ||
      !category ||
      !zone ||
      !address ||
      !startDate ||
      !endDate ||
      !coordinates ||
      coordinates.latitude === undefined ||
      coordinates.longitude === undefined
    ) {
      return res.status(400).json({
        message:
          "title, department, category, zone, address, startDate, endDate and coordinates (latitude, longitude) are required"
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        message: "endDate must be after startDate"
      });
    }

    const project = await Project.create({
      title,
      description: description || "",
      department,
      createdBy: req.user.userId,
      category,
      zone,
      address,
      coordinates: {
        latitude: Number(coordinates.latitude),
        longitude: Number(coordinates.longitude)
      },
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      estimatedBudget: estimatedBudget || 0,
      priority: priority || "medium",
      status: "proposed"
    });

    // Detect spatial and temporal conflicts
    const detectedConflicts = await detectAndRecordConflicts(project);

    await logAudit({
      action: "PROJECT_CREATED",
      performedBy: req.user.userId,
      targetType: "Project",
      targetId: project._id,
      description: `Project "${title}" created. Detected ${detectedConflicts.length} potential conflict(s).`,
      newState: project.toObject(),
      department,
      ipAddress: req.ip
    });

    return res.status(201).json({
      message: "Project created successfully",
      project,
      conflictsDetected: detectedConflicts.length,
      conflicts: detectedConflicts
    });
  } catch (error) {
    console.error("createProject error:", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error while creating project" });
  }
};

// ─── GET ALL PROJECTS ────────────────────────────────────────────────────────
const getAllProjects = async (req, res) => {
  try {
    const {
      department,
      status,
      category,
      zone,
      search,
      startDate,
      endDate
    } = req.query;

    const filter = {};

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (zone) filter.zone = zone;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (startDate || endDate) {
      if (startDate && !isNaN(new Date(startDate).getTime())) {
        filter.endDate = { $gte: new Date(startDate) };
      }
      if (endDate && !isNaN(new Date(endDate).getTime())) {
        filter.startDate = { $lte: new Date(endDate) };
      }
    }

    const projects = await Project.find(filter)
      .populate("department", "name code")
      .populate("createdBy", "name email role")
      .sort({ startDate: 1 });

    return res.json({
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error("getAllProjects error:", error.message);
    return res.status(500).json({ message: "Server error while fetching projects" });
  }
};

// ─── GET SINGLE PROJECT ───────────────────────────────────────────────────────
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("department", "name code contactEmail")
      .populate("createdBy", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Find all conflicts involving this project
    const conflicts = await Conflict.find({
      $or: [{ projectA: project._id }, { projectB: project._id }]
    })
      .populate("projectA", "title category status startDate endDate")
      .populate("projectB", "title category status startDate endDate")
      .populate("departmentsInvolved", "name code");

    return res.json({
      project,
      conflictsCount: conflicts.length,
      conflicts
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    console.error("getProjectById error:", error.message);
    return res.status(500).json({ message: "Server error while fetching project" });
  }
};

// ─── UPDATE PROJECT ──────────────────────────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Role check: Only city_admin or project's own department_head
    if (
      req.user.role === "department_head" &&
      project.department.toString() !== req.user.department?.toString()
    ) {
      return res.status(403).json({
        message: "You can only update projects belonging to your department"
      });
    }

    const previousState = project.toObject();

    const allowedFields = [
      "title",
      "description",
      "category",
      "zone",
      "address",
      "coordinates",
      "startDate",
      "endDate",
      "estimatedBudget",
      "actualCost",
      "status",
      "priority"
    ];

    let datesOrLocationChanged = false;

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "startDate" || field === "endDate" || field === "coordinates" || field === "zone") {
          datesOrLocationChanged = true;
        }
        project[field] = req.body[field];
      }
    });

    if (new Date(project.startDate) >= new Date(project.endDate)) {
      return res.status(400).json({
        message: "endDate must be after startDate"
      });
    }

    await project.save();

    let newConflicts = [];
    if (datesOrLocationChanged) {
      newConflicts = await detectAndRecordConflicts(project);
    }

    await logAudit({
      action: "PROJECT_UPDATED",
      performedBy: req.user.userId,
      targetType: "Project",
      targetId: project._id,
      description: `Project "${project.title}" updated`,
      previousState,
      newState: project.toObject(),
      department: project.department,
      ipAddress: req.ip
    });

    return res.json({
      message: "Project updated successfully",
      project,
      conflicts: newConflicts
    });
  } catch (error) {
    console.error("updateProject error:", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error while updating project" });
  }
};

// ─── CANCEL / DELETE PROJECT ──────────────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (
      req.user.role === "department_head" &&
      project.department.toString() !== req.user.department?.toString()
    ) {
      return res.status(403).json({
        message: "You can only cancel projects belonging to your department"
      });
    }

    // Soft delete: set status to cancelled
    project.status = "cancelled";
    await project.save();

    // Mark active conflicts as resolved (cancelled)
    await Conflict.updateMany(
      {
        $or: [{ projectA: project._id }, { projectB: project._id }],
        status: { $in: ["detected", "under_review"] }
      },
      {
        status: "resolved",
        resolutionNotes: `Auto-resolved: Project "${project.title}" was cancelled.`,
        resolvedBy: req.user.userId,
        resolvedAt: new Date()
      }
    );

    await logAudit({
      action: "PROJECT_CANCELLED",
      performedBy: req.user.userId,
      targetType: "Project",
      targetId: project._id,
      description: `Project "${project.title}" was cancelled`,
      department: project.department,
      ipAddress: req.ip
    });

    return res.json({
      message: "Project cancelled and associated conflicts resolved"
    });
  } catch (error) {
    console.error("deleteProject error:", error.message);
    return res.status(500).json({ message: "Server error while cancelling project" });
  }
};

// ─── MASTER CITY TIMELINE (GANTT VIEW) ────────────────────────────────────────
const getTimelineSchedule = async (req, res) => {
  try {
    const { department, category, status } = req.query;
    const filter = { status: { $ne: "cancelled" } };

    if (department) filter.department = department;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .populate("department", "name code")
      .sort({ startDate: 1 });

    // Count active conflicts per project
    const activeConflicts = await Conflict.find({
      status: { $in: ["detected", "under_review"] }
    });

    const conflictCountMap = {};
    activeConflicts.forEach((c) => {
      const pA = c.projectA.toString();
      const pB = c.projectB.toString();
      conflictCountMap[pA] = (conflictCountMap[pA] || 0) + 1;
      conflictCountMap[pB] = (conflictCountMap[pB] || 0) + 1;
    });

    const timeline = projects.map((p) => ({
      id: p._id,
      title: p.title,
      department: p.department,
      category: p.category,
      zone: p.zone,
      address: p.address,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
      priority: p.priority,
      activeConflicts: conflictCountMap[p._id.toString()] || 0
    }));

    return res.json({
      count: timeline.length,
      timeline
    });
  } catch (error) {
    console.error("getTimelineSchedule error:", error.message);
    return res.status(500).json({ message: "Server error while generating timeline" });
  }
};

// ─── CALENDAR VIEW ────────────────────────────────────────────────────────────
const getCalendarSchedule = async (req, res) => {
  try {
    const { year, month } = req.query;
    const filter = { status: { $ne: "cancelled" } };

    if (year && month) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      filter.startDate = { $lte: endOfMonth };
      filter.endDate = { $gte: startOfMonth };
    }

    const projects = await Project.find(filter)
      .populate("department", "name code")
      .sort({ startDate: 1 });

    return res.json({
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error("getCalendarSchedule error:", error.message);
    return res.status(500).json({ message: "Server error while fetching calendar schedule" });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getTimelineSchedule,
  getCalendarSchedule
};
