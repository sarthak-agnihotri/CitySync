
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require("../controllers/notificationController");

// All notification routes require authentication
router.use(authMiddleware);

// GET /api/notifications — get current user's notifications (?unreadOnly=true)
router.get("/", getMyNotifications);

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", markAllAsRead);

// PATCH /api/notifications/:id/read — mark single notification as read
router.patch("/:id/read", markAsRead);

// DELETE /api/notifications/:id — delete a notification
router.delete("/:id", deleteNotification);

module.exports = router;
