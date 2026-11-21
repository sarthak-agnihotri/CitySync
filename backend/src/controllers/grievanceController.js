const Grievance = require("../models/Grievance");
const Department = require("../models/Department");
const User = require("../models/User");

// GET GRIEVANCES BASED ON USER ROLE
const getGrievances = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "department_head") {
      if (!req.user.department) {
        return res.status(403).json({
          message: "You are not assigned to a department"
        });
      }

      filter.assignedDepartmentId = req.user.department;
    } else if (req.user.role === "officer") {
      filter.assignedTo = req.user.userId;
    } else if (req.user.role !== "city_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const grievances = await Grievance.find(filter)
      .populate("assignedDepartmentId", "name code")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ grievances });
  } catch (error) {
    console.error("Get grievances error:", error);
    res.status(500).json({ message: "Failed to fetch grievances" });
  }
};

// ASSIGN GRIEVANCE TO AN OFFICER
const assignGrievance = async (req, res) => {
  try {
    const { departmentId, officerId } = req.body;

    if (!departmentId || !officerId) {
      return res.status(400).json({
        message: "Department and officer are required"
      });
    }

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    const department = await Department.findOne({
      _id: departmentId,
      isActive: true
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found or inactive" });
    }

    // Department Heads can assign only within their own department.
    if (
      req.user.role === "department_head" &&
      String(req.user.department) !== String(department._id)
    ) {
      return res.status(403).json({
        message: "You can assign grievances only to your department"
      });
    }

    const officer = await User.findOne({
      _id: officerId,
      role: "officer",
      department: department._id
    });

    if (!officer) {
      return res.status(400).json({
        message: "Selected officer does not belong to this department"
      });
    }

    grievance.assignedDepartmentId = department._id;
    grievance.assignedDepartment = department.name;
    grievance.assignedTo = officer._id;
    grievance.assignedBy = req.user.userId;
    grievance.assignedAt = new Date();
    grievance.status = "assigned_to_dept";

    await grievance.save();

    
    // Notify the assigned Officer
    try {
      await Grievance.db.collection("notifications").insertOne({
        recipient: officer._id,
        recipientDepartment: department._id,
        type: "grievance_assigned",
        title: "New Grievance Assigned",
        message: `Grievance ${grievance.ticketId} has been assigned to you.`,
        relatedGrievance: grievance._id,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (notificationError) {
      console.error("Officer notification error:", notificationError.message);
    }

    // Notify the citizen about assignment
    if (grievance.citizen) {
      try {
        await Grievance.db.collection("citizennotifications").insertOne({
          citizen: grievance.citizen,
          ticketId: grievance.ticketId,
          title: "Grievance Assigned",
          message: `Your grievance has been assigned to ${department.name} for action.`,
          type: "status_change",
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (notificationError) {
        console.error("Citizen notification error:", notificationError.message);
      }
    }
res.json({
      message: "Grievance assigned successfully",
      grievance
    });
  } catch (error) {
    console.error("Assign grievance error:", error);
    res.status(500).json({ message: "Failed to assign grievance" });
  }
};

// OFFICER UPDATES GRIEVANCE STATUS
const updateGrievance = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    const allowedStatuses = ["in_progress", "resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid grievance status"
      });
    }

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    const isAdmin = req.user.role === "city_admin";

    const isAssignedOfficer =
      req.user.role === "officer" &&
      String(grievance.assignedTo) === String(req.user.userId);

    if (!isAdmin && !isAssignedOfficer) {
      return res.status(403).json({
        message: "You are not authorized to update this grievance"
      });
    }

    if (status === "resolved" && !resolutionNotes?.trim()) {
      return res.status(400).json({
        message: "Resolution notes are required"
      });
    }

    grievance.status = status;

    if (resolutionNotes !== undefined) {
      grievance.resolutionNotes = resolutionNotes.trim();
    }

    if (status === "resolved") {
      grievance.resolvedAt = new Date();
    } else {
      grievance.resolvedAt = null;
    }

    await grievance.save();

    
    // Notify the citizen about the latest grievance status
    if (grievance.citizen) {
      try {
        const isResolved = status === "resolved";

        await Grievance.db.collection("citizennotifications").insertOne({
          citizen: grievance.citizen,
          ticketId: grievance.ticketId,
          title: isResolved ? "Grievance Resolved" : "Grievance In Progress",
          message: isResolved
            ? `Your grievance ${grievance.ticketId} has been resolved. ${grievance.resolutionNotes}`
            : `Work has started on your grievance ${grievance.ticketId}.`,
          type: isResolved ? "resolved" : "status_change",
          read: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (notificationError) {
        console.error("Citizen status notification error:", notificationError.message);
      }
    }
res.json({
      message: "Grievance updated successfully",
      grievance
    });
  } catch (error) {
    console.error("Update grievance error:", error);
    res.status(500).json({ message: "Failed to update grievance" });
  }
};

module.exports = {
  getGrievances,
  assignGrievance,
  updateGrievance
};

