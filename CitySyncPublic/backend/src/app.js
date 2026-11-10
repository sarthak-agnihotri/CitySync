const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const citizenAuthRoutes = require("./routes/citizenAuthRoutes");
const grievanceRoutes = require("./routes/grievanceRoutes");

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded grievance photos statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health Checks
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "CitySync Citizen Grievance Portal API", port: 5001 });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CitySyncPublic backend is live" });
});

// Citizen Portal API Routes
app.use("/api/citizen/auth", citizenAuthRoutes);
app.use("/api/citizen/grievances", grievanceRoutes);

module.exports = app;

