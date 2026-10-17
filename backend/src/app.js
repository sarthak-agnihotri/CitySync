
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const departmentRoutes = require("./routes/departmentRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const requestRoutes = require("./routes/requestRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const auditRoutes = require("./routes/auditRoutes");

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

// Member 5 — Resource Sharing & Notifications
app.use("/api/resources", resourceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);

module.exports = app;
