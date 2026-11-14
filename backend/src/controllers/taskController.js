
const Task = require("../models/Task");
const Milestone = require("../models/Milestone");
const Project = require("../models/Project");
const User = require("../models/User");

const {
  logAudit,
  createNotification
} = require("../utils/notifyAudit");

// Check whether user can manage tasks for a project
const canManageTasks = (user, project) => {
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

// Check whether user can view tasks for a project
const canViewTasks = (user, project) => {
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

// CREATE AND ASSIGN TASK
const createTask = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const {
      title,
      description,
      assignedTo,
      dueDate,
      priority
    } = req.body;

    if (!title || !assignedTo || !dueDate) {
      return res.status(400).json({
        message: "Title, assigned officer and due date are required"
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        message: "A valid task title is required"
      });
    }

    const milestone = await Milestone.findById(milestoneId);

    if (!milestone) {
      return res.status(404).json({
        message: "Milestone not found"
      });
    }
    if (milestone.status === "completed") {
      return res.status(400).json({
        message: "Tasks cannot be assigned to a completed milestone"
      });
    }

    const project = await Project.findById(milestone.project);

    if (!project) {
      return res.status(404).json({
        message: "Associated project not found"
      });
    }

    if (!canManageTasks(req.user, project)) {
      return res.status(403).json({
        message: "You cannot assign tasks for this department"
      });
    }

    if (
      project.status === "completed" ||
      project.status === "cancelled"
    ) {
      return res.status(400).json({
        message: "Tasks cannot be assigned to completed or cancelled projects"
      });
    }

    const officer = await User.findById(assignedTo);

    if (!officer) {
      return res.status(404).json({
        message: "Assigned user not found"
      });
    }

    if (officer.role !== "officer") {
      return res.status(400).json({
        message: "Tasks can only be assigned to officers"
      });
    }

    if (
      officer.department?.toString() !==
      milestone.department.toString()
    ) {
      return res.status(400).json({
        message: "Officer must belong to the milestone's department"
      });
    }

    const taskDueDate = new Date(dueDate);

    if (isNaN(taskDueDate.getTime())) {
      return res.status(400).json({
        message: "A valid due date is required"
      });
    }

    if (
      taskDueDate < milestone.startDate ||
      taskDueDate > milestone.dueDate
    ) {
      return res.status(400).json({
        message: "Task due date must be within milestone dates"
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      milestone: milestone._id,
      project: project._id,
      department: milestone.department,
      assignedTo: officer._id,
      assignedBy: req.user.userId,
      dueDate: taskDueDate,
      priority: priority || "medium"
    });

    await logAudit({
      action: "TASK_ASSIGNED",
      performedBy: req.user.userId,
      targetType: "Task",
      targetId: task._id,
      description: `Task "${task.title}" assigned to ${officer.name}`,
      newState: task.toObject(),
      department: task.department,
      ipAddress: req.ip
    });

    await createNotification({
      recipient: officer._id,
      recipientDepartment: officer.department,
      type: "task_assigned",
      title: "New Task Assigned",
      message: `You have been assigned "${task.title}" for milestone "${milestone.title}"`,
      relatedProject: project._id,
      relatedTask: task._id
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .populate("milestone", "title")
      .populate("department", "name code");

    return res.status(201).json({
      message: "Task assigned successfully",
      task: populatedTask
    });
  } catch (error) {
    console.error("createTask error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid milestone or officer ID"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Server error while assigning task"
    });
  }
};


// GET TASKS FOR A MILESTONE
const getMilestoneTasks = async (req, res) => {
  try {
    const milestone = await Milestone.findById(
      req.params.milestoneId
    );

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

    if (!canViewTasks(req.user, project)) {
      return res.status(403).json({
        message: "You cannot view tasks for this department"
      });
    }

    const filter = {
      milestone: milestone._id
    };

    // Officers can only view their own assigned tasks
    if (req.user.role === "officer") {
      filter.assignedTo = req.user.userId;
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .populate("milestone", "title")
      .populate("department", "name code")
      .sort({ dueDate: 1 });

    return res.json({
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error("getMilestoneTasks error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid milestone ID"
      });
    }

    return res.status(500).json({
      message: "Server error while fetching tasks"
    });
  }
};


// GET MY ASSIGNED TASKS
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.userId
    })
      .populate("project", "title status")
      .populate("milestone", "title startDate dueDate")
      .populate("department", "name code")
      .populate("assignedBy", "name email")
      .sort({ dueDate: 1 });

    return res.json({
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error("getMyTasks error:", error.message);

    return res.status(500).json({
      message: "Server error while fetching assigned tasks"
    });
  }
};


// UPDATE TASK
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Associated project not found"
      });
    }

    const isManager = canManageTasks(req.user, project);
    const isAssignedOfficer =
      req.user.role === "officer" &&
      task.assignedTo.toString() === req.user.userId;

    if (!isManager && !isAssignedOfficer) {
      return res.status(403).json({
        message: "You cannot update this task"
      });
    }

    if (
      project.status === "completed" ||
      project.status === "cancelled"
    ) {
      return res.status(400).json({
        message: "Tasks cannot be updated for completed or cancelled projects"
      });
    }

    const milestone = await Milestone.findById(task.milestone);

    if (!milestone) {
      return res.status(404).json({
        message: "Associated milestone not found"
      });
    }

    const previousState = task.toObject();

    // Officers can only update task status
    if (isAssignedOfficer) {
      if (
        Object.keys(req.body).some(
          (field) => field !== "status"
        )
      ) {
        return res.status(403).json({
          message: "Officers can only update task status"
        });
      }

      if (
        !["pending", "in_progress", "completed", "blocked"]
          .includes(req.body.status)
      ) {
        return res.status(400).json({
          message: "Invalid task status"
        });
      }

      task.status = req.body.status;
    } else {
      const allowedFields = [
        "title",
        "description",
        "dueDate",
        "priority",
        "status"
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          task[field] = req.body[field];
        }
      });

      if (
        typeof task.title !== "string" ||
        !task.title.trim()
      ) {
        return res.status(400).json({
          message: "A valid task title is required"
        });
      }

      const updatedDueDate = new Date(task.dueDate);

      if (
        isNaN(updatedDueDate.getTime()) ||
        updatedDueDate < milestone.startDate ||
        updatedDueDate > milestone.dueDate
      ) {
        return res.status(400).json({
          message: "Task due date must be within milestone dates"
        });
      }
    }

    await task.save();

    await logAudit({
      action: "TASK_UPDATED",
      performedBy: req.user.userId,
      targetType: "Task",
      targetId: task._id,
      description: `Task "${task.title}" updated`,
      previousState,
      newState: task.toObject(),
      department: task.department,
      ipAddress: req.ip
    });

    return res.json({
      message: "Task updated successfully",
      task
    });
  } catch (error) {
    console.error("updateTask error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task data"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Server error while updating task"
    });
  }
};


// DELETE TASK
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Associated project not found"
      });
    }

    if (!canManageTasks(req.user, project)) {
      return res.status(403).json({
        message: "You cannot delete this task"
      });
    }

    if (
      project.status === "completed" ||
      project.status === "cancelled"
    ) {
      return res.status(400).json({
        message: "Tasks cannot be deleted from completed or cancelled projects"
      });
    }

    await Task.findByIdAndDelete(task._id);

    await logAudit({
      action: "TASK_DELETED",
      performedBy: req.user.userId,
      targetType: "Task",
      targetId: task._id,
      description: `Task "${task.title}" deleted`,
      previousState: task.toObject(),
      department: task.department,
      ipAddress: req.ip
    });

    return res.json({
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("deleteTask error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    return res.status(500).json({
      message: "Server error while deleting task"
    });
  }
};


module.exports = {
  createTask,
  getMilestoneTasks,
  getMyTasks,
  updateTask,
  deleteTask
};
