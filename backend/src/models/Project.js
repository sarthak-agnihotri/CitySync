const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: "",
      trim: true
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    category: {
      type: String,
      enum: [
        "roadwork",
        "water_sewage",
        "electricity",
        "telecom",
        "metro_transit",
        "other"
      ],
      required: true
    },

    zone: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    coordinates: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    estimatedBudget: {
      type: Number,
      default: 0,
      min: 0
    },

    actualCost: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "proposed",
        "approved",
        "in_progress",
        "delayed",
        "completed",
        "cancelled"
      ],
      default: "proposed"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    }
  },
  { timestamps: true }
);

// Indexes for faster lookups & geospatial/date filtering
projectSchema.index({ department: 1, status: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });
projectSchema.index({ "coordinates.latitude": 1, "coordinates.longitude": 1 });
projectSchema.index({ zone: 1 });

module.exports = mongoose.model("Project", projectSchema);
