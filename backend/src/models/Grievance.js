const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    ticketId: String,
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CitizenUser"
    },
    citizenName: String,
    citizenPhone: String,
    citizenEmail: String,
    category: String,
    title: String,
    description: String,
    zone: String,
    landmark: String,

    coordinates: {
      latitude: Number,
      longitude: Number
    },

    images: [
      {
        url: String,
        originalName: String
      }
    ],

    status: String,
    assignedDepartment: String,

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

    priority: String,
    resolutionNotes: String,
    resolutionImage: String,
    resolvedAt: Date,
    reopenReason: String,
    reopenedAt: Date,
    slaHours: Number,
    slaDeadline: Date
  },
  {
    timestamps: true,
    strict: false
  }
);

// Explicitly use the citizen portal's existing collection.
module.exports =
  mongoose.models.Grievance ||
  mongoose.model("Grievance", grievanceSchema, "grievances");
