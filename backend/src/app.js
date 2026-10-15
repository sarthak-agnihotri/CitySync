
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const departmentRoutes = require("./routes/departmentRoutes");
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "CitySync backend is running" });
});

app.use("/api/auth", authRoutes);

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user
  });
});

app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
module.exports = app;
