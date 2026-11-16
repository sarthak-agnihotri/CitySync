const mongoose = require("mongoose");

const citizenNotificationSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CitizenUser",
      required: true,
      index: true
    },
    ticketId: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["submitted", "status_change", "resolved", "reopened", "upvoted", "general"],
      default: "general"
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("CitizenNotification", citizenNotificationSchema);
