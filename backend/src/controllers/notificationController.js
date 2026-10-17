
const Notification = require("../models/Notification");

// ─── GET MY NOTIFICATIONS ─────────────────────────────────────────────────────
const getMyNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const filter = { recipient: req.user.userId };

    if (unreadOnly === "true") filter.isRead = false;

    const notifications = await Notification.find(filter)
      .populate("relatedRequest", "status purpose")
      .populate("relatedResource", "name category")
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.userId,
      isRead: false
    });

    return res.json({ unreadCount, count: notifications.length, notifications });
  } catch (error) {
    console.error("getMyNotifications error:", error.message);
    return res.status(500).json({ message: "Server error while fetching notifications" });
  }
};

// ─── MARK NOTIFICATION AS READ ────────────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("markAsRead error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── MARK ALL AS READ ─────────────────────────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllAsRead error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE NOTIFICATION ──────────────────────────────────────────────────────
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.recipient.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await notification.deleteOne();
    return res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("deleteNotification error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
