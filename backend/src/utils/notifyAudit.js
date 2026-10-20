
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");

/**
 * Create a notification for a single user.
 */
const createNotification = async ({
  recipient,
  recipientDepartment = null,
  type,
  title,
  message,
  relatedRequest = null,
  relatedResource = null,
  relatedProject = null
}) => {
  try {
    await Notification.create({
      recipient,
      recipientDepartment,
      type,
      title,
      message,
      relatedRequest,
      relatedResource,
      relatedProject
    });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};

/**
 * Create notifications for multiple users at once.
 * recipients: array of user IDs
 */
const createBulkNotifications = async (recipients, notificationData) => {
  try {
    const docs = recipients.map((userId) => ({
      recipient: userId,
      ...notificationData
    }));
    await Notification.insertMany(docs);
  } catch (err) {
    console.error("Failed to create bulk notifications:", err.message);
  }
};

/**
 * Write an audit log entry.
 */
const logAudit = async ({
  action,
  performedBy,
  targetType,
  targetId,
  description,
  previousState = null,
  newState = null,
  department = null,
  ipAddress = ""
}) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetType,
      targetId,
      description,
      previousState,
      newState,
      department,
      ipAddress
    });
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
};

module.exports = { createNotification, createBulkNotifications, logAudit };
