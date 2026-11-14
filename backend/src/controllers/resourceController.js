const mongoose = require("mongoose");
const Resource = require("../models/Resource");
const { logAudit, createNotification } = require("../utils/notifyAudit");
const User = require("../models/User");

// ─── CREATE RESOURCE ─────────────────────────────────────────────────────────
const createResource = async (req, res) => {
  try {
    let {
      name,
      category,
      description,
      quantity,
      unit,
      ownerDepartment,
      location,
      tags,
      latitude,
      longitude,
    } = req.body;

    if (req.user.role === "department_head" && req.user.department) {
      if (!ownerDepartment) {
        ownerDepartment = req.user.department;
      } else if (
        ownerDepartment.toString() !== req.user.department.toString()
      ) {
        return res.status(403).json({
          message: "Department heads can only create resources for their own department"
        });
      }
    }

    if (!name || !category || quantity === undefined || !ownerDepartment) {
      return res.status(400).json({
        message: "name, category, quantity and ownerDepartment are required"
      });
    }

    const resource = await Resource.create({
      name,
      category,
      description,
      quantity,
      availableQuantity: quantity,
      unit,
      ownerDepartment,
      location,
      tags,
      latitude,
      longitude,
    });

    await logAudit({
      action: "RESOURCE_CREATED",
      performedBy: req.user.userId,
      targetType: "Resource",
      targetId: resource._id,
      description: `Resource "${name}" created with quantity ${quantity}`,
      newState: resource.toObject(),
      department: ownerDepartment,
      ipAddress: req.ip
    });

    return res.status(201).json({
      message: "Resource created successfully",
      resource
    });
  } catch (error) {
    console.error("createResource error:", error.message);
    return res.status(500).json({ message: "Server error while creating resource" });
  }
};

// ─── GET ALL RESOURCES ────────────────────────────────────────────────────────
const getAllResources = async (req, res) => {
  try {
    const { department, category, status, search } = req.query;
    const filter = { isActive: true };

    // Officers can only view their own department's resources
    if (req.user.role === "officer") {
      if (!req.user.department) {
        return res.status(403).json({
          message: "You are not assigned to any department"
        });
      }

      filter.ownerDepartment = req.user.department;
    }

    // Assigned Department Heads can only view their own department's resources
    else if (
      req.user.role === "department_head" &&
      req.user.department
    ) {
      filter.ownerDepartment = req.user.department;
    }

    // City Admin and Central Department Head can view all departments
    else if (department) {
      filter.ownerDepartment = department;
    }
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const resources = await Resource.find(filter)
      .populate("ownerDepartment", "name code")
      .sort({ createdAt: -1 });

    return res.json({ count: resources.length, resources });
  } catch (error) {
    console.error("getAllResources error:", error.message);
    return res.status(500).json({ message: "Server error while fetching resources" });
  }
};

// ─── GET SINGLE RESOURCE ──────────────────────────────────────────────────────
const getResourceById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Resource not found" });
  }

  try {
    const resource = await Resource.findById(req.params.id).populate(
      "ownerDepartment",
      "name code"
    );

    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }
    // Officers and assigned Department Heads can only access
    // resources belonging to their own department.
    const resourceDepartmentId =
      resource.ownerDepartment?._id?.toString() ||
      resource.ownerDepartment?.toString();

    const userDepartmentId = req.user.department?.toString();

    const isDepartmentScopedUser =
      req.user.role === "officer" ||
      (req.user.role === "department_head" && req.user.department);

    if (
      isDepartmentScopedUser &&
      resourceDepartmentId !== userDepartmentId
    ) {
      return res.status(403).json({
        message: "You do not have access to this department's resource"
      });
    }

    return res.json({ resource });
  } catch (error) {
    console.error("getResourceById error:", error.message);
    return res.status(500).json({ message: "Server error while fetching resource" });
  }
};

// ─── UPDATE RESOURCE ──────────────────────────────────────────────────────────
const updateResource = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Resource not found" });
  }

  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (
      req.user.role === "department_head" &&
      req.user.department &&
      resource.ownerDepartment.toString() !== req.user.department.toString()
    ) {
      return res.status(403).json({
        message: "You can only update resources belonging to your department"
      });
    }

    const allowedFields = [
      "name",
      "description",
      "quantity",
      "availableQuantity",
      "unit",
      "location",
      "latitude",
      "longitude",
      "tags",
      "status"
    ];

    const previousState = resource.toObject();

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        resource[field] = req.body[field];
      }
    });

    await resource.save();

    // Notify if inventory is running low (< 20% available)
    if (resource.availableQuantity / resource.quantity < 0.2) {
      const adminUsers = await User.find({
        role: "city_admin"
      }).select("_id");

      const departmentHeads = await User.find({
        role: "department_head",
        $or: [
          { department: resource.ownerDepartment },
          { department: null }
        ]
      }).select("_id");

      const recipients = new Set([
        ...adminUsers.map((u) => u._id.toString()),
        ...departmentHeads.map((u) => u._id.toString())
      ]);

      for (const recipientId of recipients) {
        await createNotification({
          recipient: recipientId,
          recipientDepartment: resource.ownerDepartment,
          type: "inventory_low",
          title: "⚠️ Low Inventory Alert",
          message: `Resource "${resource.name}" is running low. Only ${resource.availableQuantity} of ${resource.quantity} ${resource.unit} available.`,
          relatedResource: resource._id
        });
      }
    }

    await logAudit({
      action: "RESOURCE_UPDATED",
      performedBy: req.user.userId,
      targetType: "Resource",
      targetId: resource._id,
      description: `Resource "${resource.name}" updated`,
      previousState,
      newState: resource.toObject(),
      department: resource.ownerDepartment,
      ipAddress: req.ip
    });

    return res.json({ message: "Resource updated successfully", resource });
  } catch (error) {
    console.error("updateResource error:", error.message);
    return res.status(500).json({ message: "Server error while updating resource" });
  }
};

// ─── DEACTIVATE RESOURCE ──────────────────────────────────────────────────────
const deactivateResource = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: "Resource not found" });
  }

  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }
    // Department Heads can deactivate only their own department's resources
    if (
      req.user.role === "department_head" &&
      req.user.department &&
      resource.ownerDepartment.toString() !== req.user.department.toString()
    ) {
      return res.status(403).json({
        message: "You can only deactivate resources belonging to your department"
      });
    }

    // Officers cannot deactivate resources
    if (req.user.role === "officer") {
      return res.status(403).json({
        message: "Officers cannot deactivate resources"
      });
    }
    resource.isActive = false;
    await resource.save();

    await logAudit({
      action: "RESOURCE_DEACTIVATED",
      performedBy: req.user.userId,
      targetType: "Resource",
      targetId: resource._id,
      description: `Resource "${resource.name}" was deactivated`,
      ipAddress: req.ip
    });

    return res.json({ message: "Resource deactivated successfully" });
  } catch (error) {
    console.error("deactivateResource error:", error.message);
    return res.status(500).json({ message: "Server error while deactivating resource" });
  }
};

module.exports = {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deactivateResource
};
