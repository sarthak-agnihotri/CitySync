
const mongoose = require("mongoose");

const resourceRequestSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    requestingDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },

    quantityRequested: {
      type: Number,
      required: true,
      min: 1
    },

    purpose: {
      type: String,
      required: true,
      trim: true
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "returned", "cancelled"],
      default: "pending"
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    reviewedAt: {
      type: Date,
      default: null
    },

    rejectionReason: {
      type: String,
      default: ""
    },

    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResourceRequest", resourceRequestSchema);
