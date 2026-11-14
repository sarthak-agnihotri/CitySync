
const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
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

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
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

    startDate: {
      type: Date,
      required: true
    },

    dueDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "blocked"],
      default: "pending"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium"
    }
  },
  { timestamps: true }
);

milestoneSchema.index({ project: 1, status: 1 });
milestoneSchema.index({ department: 1, dueDate: 1 });

module.exports = mongoose.model("Milestone", milestoneSchema);
