
const Resource = require("../models/Resource");
const { logAudit, createNotification } = require("../utils/notifyAudit");
const User = require("../models/User");

// ─── CREATE RESOURCE ─────────────────────────────────────────────────────────
const createResource = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      quantity,
      unit,
      ownerDepartment,
      location,
      tags
    } = req.body;

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
      tags
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
    const { department, category, status } = req.query;
    const filter = { isActive: true };

    if (department) filter.ownerDepartment = department;
    if (category) filter.category = category;
    if (status) filter.status = status;

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
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "ownerDepartment",
      "name code"
    );

    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    return res.json({ resource });
  } catch (error) {
    console.error("getResourceById error:", error.message);
    return res.status(500).json({ message: "Server error while fetching resource" });
  }
};

// ─── UPDATE RESOURCE ──────────────────────────────────────────────────────────
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const allowedFields = [
      "name",
      "description",
      "quantity",
      "availableQuantity",
      "unit",
      "location",
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
      const adminUsers = await User.find({ role: "city_admin" }).select("_id");
      const departmentHead = await User.findOne({
        department: resource.ownerDepartment,
        role: "department_head"
      }).select("_id");

      const recipients = adminUsers.map((u) => u._id);
      if (departmentHead) recipients.push(departmentHead._id);

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
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: "Resource not found" });
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
