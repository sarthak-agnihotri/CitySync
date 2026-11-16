const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { citizenAuthMiddleware } = require("../middleware/citizenAuthMiddleware");
const {
  submitGrievance,
  trackGrievance,
  getMyGrievances,
  getPublicStats,
  rateGrievance,
  reopenGrievance,
  upvoteGrievance,
  getMapGrievances,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} = require("../controllers/grievanceController");

// Public endpoints
router.get("/stats", getPublicStats);
router.get("/map", getMapGrievances);
router.get("/track/:ticketId", trackGrievance);
router.post("/:ticketId/upvote", (req, res, next) => {
  // Optional auth: try to extract user if bearer token is present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return citizenAuthMiddleware(req, res, next);
  }
  next();
}, upvoteGrievance);

// Authenticated citizen endpoints
router.post("/submit", citizenAuthMiddleware, upload.array("images", 3), submitGrievance);
router.get("/my-complaints", citizenAuthMiddleware, getMyGrievances);
router.post("/:ticketId/rate", citizenAuthMiddleware, rateGrievance);
router.post("/:ticketId/reopen", citizenAuthMiddleware, reopenGrievance);

// In-portal notification endpoints
router.get("/notifications", citizenAuthMiddleware, getNotifications);
router.patch("/notifications/:id/read", citizenAuthMiddleware, markNotificationRead);
router.post("/notifications/read-all", citizenAuthMiddleware, markAllNotificationsRead);

module.exports = router;
