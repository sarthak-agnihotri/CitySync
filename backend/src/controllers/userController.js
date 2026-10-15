
const User = require("../models/User");
const Department = require("../models/Department");

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

module.exports = { assignDepartment, getUsers };
