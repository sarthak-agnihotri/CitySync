const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { citizenAuthMiddleware } = require("../middleware/citizenAuthMiddleware");
const {
  submitGrievance,
  trackGrievance,
  getMyGrievances,
  getPublicStats
} = require("../controllers/grievanceController");

// Public live summary
router.get("/stats", getPublicStats);

// Track by Ticket ID (Public)
router.get("/track/:ticketId", trackGrievance);

// Submit Grievance (Mandatory Citizen Authentication Required)
router.post("/submit", citizenAuthMiddleware, upload.array("images", 3), submitGrievance);

// Citizen authenticated routes
router.get("/my-complaints", citizenAuthMiddleware, getMyGrievances);

module.exports = router;

