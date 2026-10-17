
const ResourceRequest = require("../models/ResourceRequest");
const Resource = require("../models/Resource");
const User = require("../models/User");
const { createNotification, createBulkNotifications, logAudit } = require("../utils/notifyAudit");

// ─── SUBMIT A RESOURCE REQUEST ────────────────────────────────────────────────
const submitRequest = async (req, res) => {
  try {
    const {
      resourceId,
      quantityRequested,
      purpose,
      startDate,
      endDate,
      priority,
      notes
    } = req.body;

    if (!resourceId || !quantityRequested || !purpose || !startDate || !endDate) {
      return res.status(400).json({
        message: "resourceId, quantityRequested, purpose, startDate and endDate are required"
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "endDate must be after startDate" });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource || !resource.isActive) {
      return res.status(404).json({ message: "Resource not found" });
    }

    if (resource.availableQuantity < quantityRequested) {
      return res.status(400).json({
        message: `Only ${resource.availableQuantity} ${resource.unit} available, but ${quantityRequested} requested`
      });
    }

    // Check for time-overlap conflicts with already approved requests
    const conflict = await ResourceRequest.findOne({
      resource: resourceId,
      status: "approved",
      $or: [
        { startDate: { $lt: new Date(endDate) }, endDate: { $gt: new Date(startDate) } }
      ]
    });

    if (conflict) {
      // Notify the requester about the conflict
      await createNotification({
        recipient: req.user.userId,
        type: "resource_conflict",
        title: "⚡ Resource Conflict Detected",
        message: `There is an existing approved booking for "${resource.name}" that overlaps with your requested dates. Your request has still been submitted for review.`,
        relatedResource: resourceId
      });
    }

    const requestingDepartment =
      req.user.department || req.body.requestingDepartment;

    if (!requestingDepartment) {
      return res.status(400).json({
        message: "User must belong to a department to make a resource request"
      });
    }

    const request = await ResourceRequest.create({
      resource: resourceId,
      requestedBy: req.user.userId,
      requestingDepartment,
      quantityRequested,
      purpose,
      startDate,
      endDate,
      priority: priority || "medium",
      notes
    });

    // Notify department head and city admins about new request
    const admins = await User.find({ role: "city_admin" }).select("_id");
    const deptHead = await User.findOne({
      department: resource.ownerDepartment,
      role: "department_head"
    }).select("_id");

    const notifyIds = admins.map((a) => a._id.toString());
    if (deptHead && !notifyIds.includes(deptHead._id.toString())) {
      notifyIds.push(deptHead._id);
    }

    await createBulkNotifications(notifyIds, {
      type: "request_submitted",
      title: "📋 New Resource Request",
      message: `A new request for "${resource.name}" (${quantityRequested} ${resource.unit}) has been submitted by ${req.user.name} for the period ${new Date(startDate).toDateString()} – ${new Date(endDate).toDateString()}.`,
      relatedRequest: request._id,
      relatedResource: resourceId,
      recipientDepartment: resource.ownerDepartment
    });

    // Notify the requester as confirmation
    await createNotification({
      recipient: req.user.userId,
      type: "request_submitted",
      title: "✅ Request Submitted",
      message: `Your request for "${resource.name}" has been submitted and is awaiting approval.`,
      relatedRequest: request._id,
      relatedResource: resourceId
    });

    await logAudit({
      action: "REQUEST_SUBMITTED",
      performedBy: req.user.userId,
      targetType: "ResourceRequest",
      targetId: request._id,
      description: `Request submitted for resource "${resource.name}" (${quantityRequested} ${resource.unit})`,
      newState: request.toObject(),
      department: requestingDepartment,
      ipAddress: req.ip
    });

    return res.status(201).json({
      message: "Resource request submitted successfully",
      request
    });
  } catch (error) {
    console.error("submitRequest error:", error.message);
    return res.status(500).json({ message: "Server error while submitting request" });
  }
};

// ─── GET ALL REQUESTS (with filters) ─────────────────────────────────────────
const getAllRequests = async (req, res) => {
  try {
    const { status, department, priority, resourceId } = req.query;
    const filter = {};

    // Officers only see their own requests
    if (req.user.role === "officer") {
      filter.requestedBy = req.user.userId;
    } else if (req.user.role === "department_head") {
      // Department heads see requests for resources owned by their department
      filter.requestingDepartment = req.user.department;
    }

    if (status) filter.status = status;
    if (department && req.user.role === "city_admin") {
      filter.requestingDepartment = department;
    }
    if (priority) filter.priority = priority;
    if (resourceId) filter.resource = resourceId;

    const requests = await ResourceRequest.find(filter)
      .populate("resource", "name category unit")
      .populate("requestedBy", "name email")
      .populate("requestingDepartment", "name code")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    return res.json({ count: requests.length, requests });
  } catch (error) {
    console.error("getAllRequests error:", error.message);
    return res.status(500).json({ message: "Server error while fetching requests" });
  }
};

// ─── GET SINGLE REQUEST ───────────────────────────────────────────────────────
const getRequestById = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(req.params.id)
      .populate("resource", "name category unit status")
      .populate("requestedBy", "name email")
      .populate("requestingDepartment", "name code")
      .populate("reviewedBy", "name email");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Officers can only see their own requests
    if (
      req.user.role === "officer" &&
      request.requestedBy._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json({ request });
  } catch (error) {
    console.error("getRequestById error:", error.message);
    return res.status(500).json({ message: "Server error while fetching request" });
  }
};

// ─── APPROVE REQUEST ──────────────────────────────────────────────────────────
const approveRequest = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(req.params.id).populate(
      "resource"
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request is already ${request.status}`
      });
    }

    const resource = request.resource;

    if (resource.availableQuantity < request.quantityRequested) {
      return res.status(400).json({
        message: `Insufficient quantity. Only ${resource.availableQuantity} available`
      });
    }

    const previousResourceState = resource.toObject();

    // Deduct quantity from resource
    resource.availableQuantity -= request.quantityRequested;
    await resource.save();

    request.status = "approved";
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    await request.save();

    // Notify the requester
    await createNotification({
      recipient: request.requestedBy,
      recipientDepartment: request.requestingDepartment,
      type: "request_approved",
      title: "✅ Request Approved",
      message: `Your request for "${resource.name}" (${request.quantityRequested} ${resource.unit}) has been approved for ${new Date(request.startDate).toDateString()} – ${new Date(request.endDate).toDateString()}.`,
      relatedRequest: request._id,
      relatedResource: resource._id
    });

    await logAudit({
      action: "REQUEST_APPROVED",
      performedBy: req.user.userId,
      targetType: "ResourceRequest",
      targetId: request._id,
      description: `Approved request for "${resource.name}" (${request.quantityRequested} ${resource.unit}). Available quantity reduced from ${previousResourceState.availableQuantity} to ${resource.availableQuantity}.`,
      previousState: { status: "pending" },
      newState: { status: "approved" },
      department: request.requestingDepartment,
      ipAddress: req.ip
    });

    return res.json({ message: "Request approved successfully", request });
  } catch (error) {
    console.error("approveRequest error:", error.message);
    return res.status(500).json({ message: "Server error while approving request" });
  }
};

// ─── REJECT REQUEST ───────────────────────────────────────────────────────────
const rejectRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const request = await ResourceRequest.findById(req.params.id).populate(
      "resource",
      "name unit"
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request is already ${request.status}`
      });
    }

    request.status = "rejected";
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason || "No reason provided";
    await request.save();

    await createNotification({
      recipient: request.requestedBy,
      recipientDepartment: request.requestingDepartment,
      type: "request_rejected",
      title: "❌ Request Rejected",
      message: `Your request for "${request.resource.name}" has been rejected. Reason: ${request.rejectionReason}`,
      relatedRequest: request._id,
      relatedResource: request.resource._id
    });

    await logAudit({
      action: "REQUEST_REJECTED",
      performedBy: req.user.userId,
      targetType: "ResourceRequest",
      targetId: request._id,
      description: `Rejected request for "${request.resource.name}". Reason: ${request.rejectionReason}`,
      previousState: { status: "pending" },
      newState: { status: "rejected", rejectionReason: request.rejectionReason },
      department: request.requestingDepartment,
      ipAddress: req.ip
    });

    return res.json({ message: "Request rejected", request });
  } catch (error) {
    console.error("rejectRequest error:", error.message);
    return res.status(500).json({ message: "Server error while rejecting request" });
  }
};

// ─── MARK AS RETURNED ─────────────────────────────────────────────────────────
const returnResource = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(req.params.id).populate(
      "resource"
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "approved") {
      return res.status(400).json({
        message: "Only approved requests can be marked as returned"
      });
    }

    const resource = request.resource;

    // Restore quantity
    resource.availableQuantity += request.quantityRequested;
    if (resource.availableQuantity > resource.quantity) {
      resource.availableQuantity = resource.quantity;
    }
    await resource.save();

    request.status = "returned";
    await request.save();

    await createNotification({
      recipient: request.requestedBy,
      recipientDepartment: request.requestingDepartment,
      type: "resource_returned",
      title: "🔄 Resource Returned",
      message: `The resource "${resource.name}" (${request.quantityRequested} ${resource.unit}) has been marked as returned. Thank you!`,
      relatedRequest: request._id,
      relatedResource: resource._id
    });

    await logAudit({
      action: "RESOURCE_RETURNED",
      performedBy: req.user.userId,
      targetType: "ResourceRequest",
      targetId: request._id,
      description: `Resource "${resource.name}" returned. Available quantity restored to ${resource.availableQuantity}.`,
      previousState: { status: "approved" },
      newState: { status: "returned" },
      department: request.requestingDepartment,
      ipAddress: req.ip
    });

    return res.json({ message: "Resource marked as returned", request });
  } catch (error) {
    console.error("returnResource error:", error.message);
    return res.status(500).json({ message: "Server error while returning resource" });
  }
};

// ─── CANCEL REQUEST ───────────────────────────────────────────────────────────
const cancelRequest = async (req, res) => {
  try {
    const request = await ResourceRequest.findById(req.params.id).populate(
      "resource",
      "name unit"
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only the requester or an admin can cancel
    if (
      req.user.role === "officer" &&
      request.requestedBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "You can only cancel your own requests" });
    }

    if (!["pending"].includes(request.status)) {
      return res.status(400).json({
        message: "Only pending requests can be cancelled"
      });
    }

    request.status = "cancelled";
    await request.save();

    await createNotification({
      recipient: request.requestedBy,
      type: "request_cancelled",
      title: "🚫 Request Cancelled",
      message: `Your request for "${request.resource.name}" has been cancelled.`,
      relatedRequest: request._id
    });

    await logAudit({
      action: "REQUEST_CANCELLED",
      performedBy: req.user.userId,
      targetType: "ResourceRequest",
      targetId: request._id,
      description: `Request for "${request.resource.name}" was cancelled`,
      previousState: { status: "pending" },
      newState: { status: "cancelled" },
      ipAddress: req.ip
    });

    return res.json({ message: "Request cancelled", request });
  } catch (error) {
    console.error("cancelRequest error:", error.message);
    return res.status(500).json({ message: "Server error while cancelling request" });
  }
};

module.exports = {
  submitRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  returnResource,
  cancelRequest
};
