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

// Member 3 — Project Management & Scheduling
const projectRoutes = require("./routes/projectRoutes");
const conflictRoutes = require("./routes/conflictRoutes");

// Dynamic CORS configuration allowing local dev and production frontend (e.g. Vercel)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, health checks)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback to allow seamless collaboration across preview URLs
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

// Root health & ping endpoints for Render health checks
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "CitySync API is live" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CitySync backend is running" });
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

// Member 3 — Project Registry & Conflict Engine
app.use("/api/projects", projectRoutes);
app.use("/api/conflicts", conflictRoutes);

module.exports = app;
