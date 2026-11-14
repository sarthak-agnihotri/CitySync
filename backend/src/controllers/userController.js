
const User = require("../models/User");
const Department = require("../models/Department");
const bcrypt = require("bcryptjs");

// Assign a department to a user
const assignDepartment = async (req, res) => {
  try {
    const { departmentId } = req.body;
    const { userId } = req.params;

    if (!departmentId) {
      return res.status(400).json({
        message: "Department ID is required"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const department = await Department.findOne({
      _id: departmentId,
      isActive: true
    });

    if (!department) {
      return res.status(404).json({
        message: "Active department not found"
      });
    }

    user.department = department._id;
    await user.save();

    res.status(200).json({
      message: "Department assigned successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: {
          id: department._id,
          name: department.name,
          code: department.code
        }
      }
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID or department ID"
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email role department createdAt")
      .populate("department", "name code")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    });
  }
};


const getDepartmentOfficers = async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Assigned Department Heads can access only their own department.
    if (
      req.user.role === "department_head" &&
      req.user.department &&
      req.user.department.toString() !== departmentId
    ) {
      return res.status(403).json({
        message: "You cannot view officers of another department"
      });
    }

    const officers = await User.find({
      role: "officer",
      department: departmentId
    })
      .select("name email role department")
      .populate("department", "name code")
      .sort({ name: 1 });

    return res.json({
      count: officers.length,
      officers
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid department ID"
      });
    }

    return res.status(500).json({
      message: "Failed to fetch department officers"
    });
  }
};


// Create a new department officer
const createOfficer = async (req, res) => {
  try {
    const { name, email, password, departmentId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !departmentId) {
      return res.status(400).json({
        message: "Name, email, password and department are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check whether email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Verify that department exists and is active
    const department = await Department.findOne({
      _id: departmentId,
      isActive: true
    });

    if (!department) {
      return res.status(404).json({
        message: "Active department not found"
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create officer
    const officer = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "officer",
      department: department._id
    });

    res.status(201).json({
      message: "Officer account created successfully",
      officer: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        role: officer.role,
        department: {
          id: department._id,
          name: department.name,
          code: department.code
        }
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid department ID"
      });
    }

    console.error("Create officer error:", error.message);

    res.status(500).json({
      message: "Failed to create officer"
    });
  }
};

// Create the central department head
const createDepartmentHead = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Validate department if provided
    if (department) {
      const departmentExists = await Department.findById(department);

      if (!departmentExists) {
        return res.status(404).json({
          message: "Department not found"
        });
      }
    } else {
      // Only one central department head is allowed
      const existingHead = await User.findOne({
        role: "department_head",
        department: null
      });

      if (existingHead) {
        return res.status(409).json({
          message: "A central department head already exists"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const departmentHead = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "department_head",
      department: department || null
    });

    return res.status(201).json({
      message: department
        ? "Department head created successfully"
        : "Central department head created successfully",
      departmentHead: {
        id: departmentHead._id,
        name: departmentHead.name,
        email: departmentHead.email,
        role: departmentHead.role,
        department: departmentHead.department
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    console.error("Create department head error:", error.message);

    return res.status(500).json({
      message: "Failed to create department head"
    });
  }
};

module.exports = {
  assignDepartment,
  getUsers,
  getDepartmentOfficers,
  createOfficer,
  createDepartmentHead
};
