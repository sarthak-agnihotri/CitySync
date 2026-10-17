
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true
      // e.g. "RESOURCE_CREATED", "REQUEST_APPROVED", "REQUEST_REJECTED", etc.
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    targetType: {
      type: String,
      enum: ["Resource", "ResourceRequest", "Notification", "User", "Department"],
      required: true
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    previousState: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    newState: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    ipAddress: {
      type: String,
      default: ""
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null
    }
  },
  { timestamps: true }
);

// Index by performedBy and createdAt for fast audit lookups
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
