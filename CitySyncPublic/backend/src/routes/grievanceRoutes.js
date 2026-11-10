const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { citizenAuthMiddleware, optionalCitizenAuth } = require("../middleware/citizenAuthMiddleware");
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

// Submit Grievance (Allows guest or authenticated citizen, accepts up to 3 images)
router.post("/submit", optionalCitizenAuth, upload.array("images", 3), submitGrievance);

// Citizen authenticated routes
router.get("/my-complaints", citizenAuthMiddleware, getMyGrievances);

module.exports = router;

