const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CitizenUser",
      default: null
    },
    citizenName: {
      type: String,
      required: true,
      trim: true
    },
    citizenPhone: {
      type: String,
      trim: true,
      default: ""
    },
    citizenEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },
    category: {
      type: String,
      required: true,
      enum: [
        "broken_road",
        "pothole",
        "water_leakage",
        "sewage_overflow",
        "street_light",
        "garbage_dumping",
        "traffic_signal",
        "other"
      ]
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    zone: {
      type: String,
      required: true,
      trim: true
    },
    landmark: {
      type: String,
      trim: true,
      default: ""
    },
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null }
    },
    images: [
      {
        url: { type: String, required: true },
        originalName: { type: String, default: "" }
      }
    ],
    status: {
      type: String,
      enum: ["submitted", "under_review", "assigned_to_dept", "in_progress", "resolved", "rejected"],
      default: "submitted"
    },
    assignedDepartment: {
      type: String,
      default: "Public Works Department"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },
    resolutionNotes: {
      type: String,
      default: ""
    },
    resolutionImage: {
      type: String,
      default: ""
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Grievance", grievanceSchema);

