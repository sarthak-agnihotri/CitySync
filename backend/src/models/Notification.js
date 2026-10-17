
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    recipientDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null
    },

    type: {
      type: String,
      enum: [
        "request_submitted",
        "request_approved",
        "request_rejected",
        "resource_returned",
        "resource_conflict",
        "deadline_reminder",
        "inventory_low",
        "request_cancelled",
        "audit_alert",
        "general"
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResourceRequest",
      default: null
    },

    relatedResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      default: null
    },

    isRead: {
      type: Boolean,
      default: false
    },

    readAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Index for faster queries per recipient
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
