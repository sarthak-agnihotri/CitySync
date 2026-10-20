
const Department = require("../models/Department");

// Create a department
const createDepartment = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      contactEmail,
      location
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Department name and code are required"
      });
    }

    const department = await Department.create({
      name,
      code,
      description,
      contactEmail,
      location
    });

    res.status(201).json({
      message: "Department created successfully",
      department
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Department name or code already exists"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message
      });
    }

    console.error("Create department error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all active departments
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({
      isActive: true
    }).sort({ name: 1 });

    res.json({
      count: departments.length,
      departments
    });
  } catch (error) {
    console.error("Get departments error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single active department by ID
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!department) {
      return res.status(404).json({ message: "Active department not found" });
    }

    res.json({ department });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid department ID" });
    }
    console.error("Get department by id error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      "name",
      "code",
      "description",
      "contactEmail",
      "location"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one valid field to update"
      });
    }

    const department = await Department.findOneAndUpdate(
      { _id: id, isActive: true },
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!department) {
      return res.status(404).json({
        message: "Active department not found"
      });
    }

    res.json({
      message: "Department updated successfully",
      department
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Department name or code already exists"
      });
    }

    if (error.name === "ValidationError" ||
        error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid department data or ID"
      });
    }

    console.error("Update department error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Deactivate a department instead of deleting it
const deactivateDepartment = async (req, res) => {
  try {
    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({
        message: "Active department not found"
      });
    }

    res.json({
      message: "Department deactivated successfully",
      department
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid department ID"
      });
    }

    console.error("Deactivate department error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deactivateDepartment
};
