const mongoose = require("mongoose");

const conflictSchema = new mongoose.Schema(
  {
    projectA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    projectB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    departmentsInvolved: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
      }
    ],

    conflictType: {
      type: String,
      enum: [
        "location_and_date_overlap",
        "date_overlap",
        "zone_overlap"
      ],
      required: true
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    },

    distanceMeters: {
      type: Number,
      default: null
    },

    status: {
      type: String,
      enum: [
        "detected",
        "under_review",
        "resolved",
        "ignored"
      ],
      default: "detected"
    },

    resolutionNotes: {
      type: String,
      default: "",
      trim: true
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    resolvedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Compound index to quickly find conflicts involving either project
conflictSchema.index({ projectA: 1, projectB: 1 });
conflictSchema.index({ status: 1 });
conflictSchema.index({ severity: 1 });

module.exports = mongoose.model("Conflict", conflictSchema);
