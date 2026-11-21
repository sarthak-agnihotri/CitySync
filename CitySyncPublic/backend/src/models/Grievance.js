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
      enum: ["submitted", "under_review", "assigned_to_dept", "in_progress", "resolved", "reopened", "rejected"],
      default: "submitted"
    },
    assignedDepartment: {
      type: String,
      default: "Public Works Department"
    },
    assignedDepartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
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
    },
    reopenReason: {
      type: String,
      default: ""
    },
    reopenedAt: {
      type: Date,
      default: null
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    satisfactionFeedback: {
      type: String,
      default: ""
    },
    ratedAt: {
      type: Date,
      default: null
    },
    upvotes: {
      type: Number,
      default: 0
    },
    upvoters: [
      {
        type: String
      }
    ],
    slaHours: {
      type: Number,
      default: 48
    },
    slaDeadline: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Grievance", grievanceSchema);


