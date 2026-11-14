
const Milestone = require("../models/Milestone");
const Project = require("../models/Project");
const { logAudit } = require("../utils/notifyAudit");

// Check whether user can access a project's department
const canAccessProject = (user, project) => {
  if (user.role === "city_admin") return true;

  if (
    user.role === "department_head" &&
    !user.department
  ) {
    return true;
  }

  return (
    user.department &&
    user.department.toString() ===
    project.department.toString()
  );
};

const canManageProject = (user, project) => {
  if (user.role === "city_admin") return true;

  if (
    user.role === "department_head" &&
    !user.department
  ) {
    return true;
  }

  return (
    user.role === "department_head" &&
    user.department?.toString() ===
    project.department.toString()
  );
};

// CREATE MILESTONE
const createMilestone = async (req, res) => {
  try {
    const { title, description, startDate, dueDate, priority } =
      req.body;

    const { projectId } = req.params;

    if (!title || !startDate || !dueDate) {
      return res.status(400).json({
        message: "Title, start date and due date are required"
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    if (!canManageProject(req.user, project)) {
      return res.status(403).json({
        message: "You cannot manage milestones for this department's project"
      });
    }

    if (
      project.status === "cancelled" ||
      project.status === "completed"
    ) {
      return res.status(400).json({
        message: "Milestones cannot be added to completed or cancelled projects"
      });
    }

    const milestoneStart = new Date(startDate);
    const milestoneDue = new Date(dueDate);

    if (
      isNaN(milestoneStart.getTime()) ||
      isNaN(milestoneDue.getTime()) ||
      milestoneStart >= milestoneDue
    ) {
      return res.status(400).json({
        message: "A valid due date after the start date is required"
      });
    }

    if (
      milestoneStart < project.startDate ||
      milestoneDue > project.endDate
    ) {
      return res.status(400).json({
        message: "Milestone dates must be within the project dates"
      });
    }

    const milestone = await Milestone.create({
      title,
      description: description || "",
      project: project._id,
      department: project.department,
      createdBy: req.user.userId,
      startDate: milestoneStart,
      dueDate: milestoneDue,
      priority: priority || "medium"
    });

    await logAudit({
      action: "MILESTONE_CREATED",
      performedBy: req.user.userId,
      targetType: "Milestone",
      targetId: milestone._id,
      description: `Milestone "${title}" created for project "${project.title}"`,
      newState: milestone.toObject(),
      department: project.department,
      ipAddress: req.ip
    });

    return res.status(201).json({
      message: "Milestone created successfully",
      milestone
    });
  } catch (error) {
    console.error("createMilestone error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Server error while creating milestone"
    });
  }
};


// UPDATE MILESTONE
const updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        message: "Milestone not found"
      });
    }

    const project = await Project.findById(milestone.project);

    if (!project) {
      return res.status(404).json({
        message: "Associated project not found"
      });
    }

    if (!canManageProject(req.user, project)) {
      return res.status(403).json({
        message: "You cannot update milestones for this department's project"
      });
    }

    if (
      project.status === "completed" ||
      project.status === "cancelled"
    ) {
      return res.status(400).json({
        message: "Milestones cannot be updated for completed or cancelled projects"
      });
    }

    const previousState = milestone.toObject();

    const allowedFields = [
      "title",
      "description",
      "startDate",
      "dueDate",
      "priority",
      "status"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        milestone[field] = req.body[field];
      }
    });

    if (
      typeof milestone.title !== "string" ||
      !milestone.title.trim()
    ) {
      return res.status(400).json({
        message: "A valid milestone title is required"
      });
    }

    const start = new Date(milestone.startDate);
    const due = new Date(milestone.dueDate);

    if (
      isNaN(start.getTime()) ||
      isNaN(due.getTime()) ||
      start >= due
    ) {
      return res.status(400).json({
        message: "A valid due date after the start date is required"
      });
    }

    if (
      start < project.startDate ||
      due > project.endDate
    ) {
      return res.status(400).json({
        message: "Milestone dates must be within the project dates"
      });
    }

    await milestone.save();

    await logAudit({
      action: "MILESTONE_UPDATED",
      performedBy: req.user.userId,
      targetType: "Milestone",
      targetId: milestone._id,
      description: `Milestone "${milestone.title}" updated`,
      previousState,
      newState: milestone.toObject(),
      department: milestone.department,
      ipAddress: req.ip
    });

    return res.json({
      message: "Milestone updated successfully",
      milestone
    });
  } catch (error) {
    console.error("updateMilestone error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid project ID"
      });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid milestone ID"
      });
    }

    return res.status(500).json({
      message: "Server error while updating milestone"
    });
  }
};


// GET MILESTONES FOR A PROJECT
const getProjectMilestones = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    if (!canAccessProject(req.user, project)) {
      return res.status(403).json({
        message: "You cannot view milestones for this department's project"
      });
    }

    const milestones = await Milestone.find({
      project: project._id
    })
      .populate("createdBy", "name email role")
      .populate("department", "name code")
      .sort({ startDate: 1 });

    return res.json({
      count: milestones.length,
      milestones
    });
  } catch (error) {
    console.error("getProjectMilestones error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid project ID"
      });
    }

    return res.status(500).json({
      message: "Server error while fetching milestones"
    });
  }
};

// DELETE MILESTONE
const deleteMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        message: "Milestone not found"
      });
    }

    const project = await Project.findById(milestone.project);

    if (!project) {
      return res.status(404).json({
        message: "Associated project not found"
      });
    }

    if (!canManageProject(req.user, project)) {
      return res.status(403).json({
        message: "You cannot delete milestones for this department's project"
      });
    }

    if (
      project.status === "completed" ||
      project.status === "cancelled"
    ) {
      return res.status(400).json({
        message: "Milestones cannot be deleted from completed or cancelled projects"
      });
    }

    const previousState = milestone.toObject();

    await Milestone.findByIdAndDelete(milestone._id);

    await logAudit({
      action: "MILESTONE_DELETED",
      performedBy: req.user.userId,
      targetType: "Milestone",
      targetId: milestone._id,
      description: `Milestone "${milestone.title}" deleted`,
      previousState,
      department: milestone.department,
      ipAddress: req.ip
    });

    return res.json({
      message: "Milestone deleted successfully"
    });
  } catch (error) {
    console.error("deleteMilestone error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid milestone ID"
      });
    }

    return res.status(500).json({
      message: "Server error while deleting milestone"
    });
  }
};

module.exports = {
  createMilestone,
  getProjectMilestones,
  updateMilestone,
  deleteMilestone
};
