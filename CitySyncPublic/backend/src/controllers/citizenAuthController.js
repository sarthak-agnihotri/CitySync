const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CitizenUser = require("../models/CitizenUser");

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await CitizenUser.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await CitizenUser.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone ? phone.trim() : "",
      address: address ? address.trim() : "",
      role: "citizen"
    });

    const token = jwt.sign(
      { userId: user._id, role: "citizen" },
      process.env.JWT_SECRET || "citysync_public_citizen_jwt_secret_key_2026",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      message: "Citizen registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: "citizen"
      }
    });
  } catch (err) {
    console.error("Citizen registration error:", err);
    res.status(500).json({ message: "Internal server error during registration" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await CitizenUser.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: "citizen" },
      process.env.JWT_SECRET || "citysync_public_citizen_jwt_secret_key_2026",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: "citizen"
      }
    });
  } catch (err) {
    console.error("Citizen login error:", err);
    res.status(500).json({ message: "Internal server error during login" });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({
      message: "Authenticated",
      user: req.user
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve user profile" });
  }
};

module.exports = { register, login, getMe };

