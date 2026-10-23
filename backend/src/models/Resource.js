
const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: [
  "equipment",
  "vehicle",
  "facility",
  "personnel",
  "materials",
  "technology",
  "other"
],
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    quantity: {
      type: Number,
      required: true,
      min: 0
    },

    availableQuantity: {
      type: Number,
      required: true,
      min: 0
    },

    unit: {
      type: String,
      default: "units"
    },

    ownerDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },

    location: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["available", "partially_available", "unavailable", "maintenance"],
      default: "available"
    },

    tags: [{ type: String, trim: true }],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Auto-update status based on available quantity
resourceSchema.pre("save", function () {
  if (this.availableQuantity <= 0) {
    this.status = "unavailable";
  } else if (this.availableQuantity < this.quantity) {
    this.status = "partially_available";
  } else {
    this.status = "available";
  }
});

module.exports = mongoose.model("Resource", resourceSchema);
