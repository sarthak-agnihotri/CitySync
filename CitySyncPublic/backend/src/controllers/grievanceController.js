const Grievance = require("../models/Grievance");
const CitizenNotification = require("../models/CitizenNotification");

// Category to default assigned department routing
const DEPT_MAP = {
  broken_road: "Public Works Department",
  pothole: "Public Works Department",
  water_leakage: "Water Supply & Sewerage Board",
  sewage_overflow: "Water Supply & Sewerage Board",
  street_light: "Electricity DISCOM",
  garbage_dumping: "Solid Waste Management",
  traffic_signal: "Traffic Police Division",
  other: "Public Works Department"
};

// SLA durations in hours by issue severity
const SLA_HOURS = {
  water_leakage: 24,
  sewage_overflow: 24,
  traffic_signal: 24,
  garbage_dumping: 24,
  pothole: 48,
  street_light: 48,
  broken_road: 72,
  other: 48
};

// Default coordinates for zones to ensure all grievances appear accurately on the civic map
const ZONE_COORDS = {
  "Zone 1 - Central Ward": { lat: 28.6139, lng: 77.2090 },
  "Zone 2 - North Ridge": { lat: 28.6800, lng: 77.2150 },
  "Zone 3 - West District": { lat: 28.6380, lng: 77.1250 },
  "Zone 4 - South Extension": { lat: 28.5680, lng: 77.2210 },
  "Zone 5 - Eastern Industrial Belt": { lat: 28.6280, lng: 77.2950 }
};

const generateTicketId = async () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const ticket = `GRV-${year}-${randomNum}`;
  const exists = await Grievance.findOne({ ticketId: ticket });
  if (exists) return generateTicketId();
  return ticket;
};

// Submit a grievance (Requires registered citizen account)
const submitGrievance = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Registration required. Please sign in or create a citizen account before submitting a complaint."
      });
    }

    const {
      category,
      title,
      description,
      zone,
      landmark,
      latitude,
      longitude
    } = req.body;

    if (!title || !description || !category || !zone) {
      return res.status(400).json({ message: "Category, title, description, and zone are required." });
    }

    const name = req.user.name;
    const phone = req.user.phone || "";
    const email = req.user.email;

    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push({
          url: `/uploads/${file.filename}`,
          originalName: file.originalname
        });
      });
    }

    const ticketId = await generateTicketId();
    const assignedDepartment = DEPT_MAP[category] || "Public Works Department";
    const sla = SLA_HOURS[category] || 48;
    const slaDeadline = new Date(Date.now() + sla * 60 * 60 * 1000);

    let parsedLat = latitude ? parseFloat(latitude) : null;
    let parsedLng = longitude ? parseFloat(longitude) : null;

    if (!parsedLat || !parsedLng) {
      const fallback = ZONE_COORDS[zone] || ZONE_COORDS["Zone 1 - Central Ward"];
      parsedLat = fallback.lat + (Math.random() - 0.5) * 0.015;
      parsedLng = fallback.lng + (Math.random() - 0.5) * 0.015;
    }

    const grievance = await Grievance.create({
      ticketId,
      citizen: req.user._id,
      citizenName: name,
      citizenPhone: phone,
      citizenEmail: email,
      category,
      title: title.trim(),
      description: description.trim(),
      zone: zone.trim(),
      landmark: landmark ? landmark.trim() : "",
      coordinates: {
        latitude: parsedLat,
        longitude: parsedLng
      },
      images,
      assignedDepartment,
      status: "submitted",
      priority: category === "pothole" || category === "water_leakage" ? "high" : "medium",
      slaHours: sla,
      slaDeadline
    });

    // Create in-portal notification for the citizen
    await CitizenNotification.create({
      citizen: req.user._id,
      ticketId: grievance.ticketId,
      title: "Grievance Ticket Registered",
      message: `Your grievance "${grievance.title}" (${ticketId}) was successfully logged and routed to ${assignedDepartment}. Expected SLA: ${sla} hours.`,
      type: "submitted"
    }).catch(() => {});

    res.status(201).json({
      message: "Grievance submitted successfully",
      ticketId: grievance.ticketId,
      grievance
    });
  } catch (err) {
    console.error("Grievance submission error:", err);
    res.status(500).json({ message: "Failed to submit grievance. Please try again." });
  }
};

// Public track by Ticket ID
const trackGrievance = async (req, res) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) {
      return res.status(400).json({ message: "Ticket ID is required" });
    }

    const grievance = await Grievance.findOne({
      ticketId: { $regex: new RegExp(`^${ticketId.trim()}$`, "i") }
    });

    if (!grievance) {
      return res.status(404).json({ message: "No complaint found with this Ticket ID" });
    }

    res.json({ grievance });
  } catch (err) {
    console.error("Tracking error:", err);
    res.status(500).json({ message: "Failed to look up grievance status" });
  }
};

// Logged-in citizen view their own complaints
const getMyGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({ citizen: req.user._id }).sort({ createdAt: -1 });
    res.json({ count: grievances.length, grievances });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve your complaints" });
  }
};

// Public grievance feed / live city stats
const getPublicStats = async (req, res) => {
  try {
    const total = await Grievance.countDocuments();
    const resolved = await Grievance.countDocuments({ status: "resolved" });
    const inProgress = await Grievance.countDocuments({
      status: { $in: ["under_review", "assigned_to_dept", "in_progress", "reopened"] }
    });
    const recent = await Grievance.find({}).sort({ createdAt: -1 }).limit(6).select("-citizenEmail -citizenPhone");

    res.json({
      stats: {
        totalReported: total,
        resolvedIssues: resolved,
        activeInvestigations: inProgress
      },
      recentComplaints: recent
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch city metrics" });
  }
};

// Rate a resolved grievance
const rateGrievance = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
    }

    const grievance = await Grievance.findOne({ ticketId });
    if (!grievance) {
      return res.status(404).json({ message: "Grievance ticket not found" });
    }

    if (grievance.status !== "resolved") {
      return res.status(400).json({ message: "Feedback can only be provided for resolved grievances" });
    }

    grievance.satisfactionRating = rating;
    grievance.satisfactionFeedback = feedback ? feedback.trim() : "";
    grievance.ratedAt = new Date();
    await grievance.save();

    if (grievance.citizen) {
      await CitizenNotification.create({
        citizen: grievance.citizen,
        ticketId: grievance.ticketId,
        title: "Feedback Recorded",
        message: `Thank you! Your ${rating}-star feedback for ticket ${ticketId} has been recorded for the department's quality audit.`,
        type: "general"
      }).catch(() => {});
    }

    res.json({ message: "Satisfaction rating recorded successfully", grievance });
  } catch (err) {
    console.error("Rate error:", err);
    res.status(500).json({ message: "Failed to submit rating" });
  }
};

// Reopen an unsatisfactorily resolved grievance
const reopenGrievance = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Please provide a reason for reopening this grievance" });
    }

    const grievance = await Grievance.findOne({ ticketId });
    if (!grievance) {
      return res.status(404).json({ message: "Grievance ticket not found" });
    }

    if (grievance.status !== "resolved") {
      return res.status(400).json({ message: "Only resolved complaints can be reopened" });
    }

    grievance.status = "reopened";
    grievance.reopenReason = reason.trim();
    grievance.reopenedAt = new Date();
    grievance.priority = "critical"; // escalate reopened issue
    await grievance.save();

    if (grievance.citizen) {
      await CitizenNotification.create({
        citizen: grievance.citizen,
        ticketId: grievance.ticketId,
        title: "Grievance Re-opened & Escalated",
        message: `Ticket ${ticketId} has been reopened with priority CRITICAL and assigned for re-inspection by ${grievance.assignedDepartment}.`,
        type: "reopened"
      }).catch(() => {});
    }

    res.json({ message: "Grievance reopened successfully", grievance });
  } catch (err) {
    console.error("Reopen error:", err);
    res.status(500).json({ message: "Failed to reopen grievance" });
  }
};

// "I am also facing this" Upvote (+1)
const upvoteGrievance = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const voterId = req.user ? req.user._id.toString() : req.body.voterId || req.ip;

    const grievance = await Grievance.findOne({ ticketId });
    if (!grievance) {
      return res.status(404).json({ message: "Grievance ticket not found" });
    }

    if (grievance.upvoters && grievance.upvoters.includes(voterId)) {
      return res.json({
        message: "You have already upvoted this grievance",
        upvotes: grievance.upvotes,
        alreadyUpvoted: true
      });
    }

    grievance.upvoters.push(voterId);
    grievance.upvotes = (grievance.upvotes || 0) + 1;

    // Escalate priority when multiple citizens confirm the same hazard
    if (grievance.upvotes >= 10) {
      grievance.priority = "critical";
    } else if (grievance.upvotes >= 4 && grievance.priority === "medium") {
      grievance.priority = "high";
    }

    await grievance.save();

    res.json({
      message: "Upvote registered (+1 community impact)",
      upvotes: grievance.upvotes,
      alreadyUpvoted: false
    });
  } catch (err) {
    console.error("Upvote error:", err);
    res.status(500).json({ message: "Failed to record upvote" });
  }
};

// Public Civic Map: list grievances with coordinates for the map
const getMapGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({})
      .select("ticketId title category status zone landmark coordinates upvotes createdAt images assignedDepartment")
      .sort({ createdAt: -1 })
      .limit(100);

    // Ensure valid coordinates
    const mapped = grievances.map((g) => {
      let lat = g.coordinates?.latitude;
      let lng = g.coordinates?.longitude;
      if (!lat || !lng) {
        const fallback = ZONE_COORDS[g.zone] || ZONE_COORDS["Zone 1 - Central Ward"];
        lat = fallback.lat;
        lng = fallback.lng;
      }
      return {
        _id: g._id,
        ticketId: g.ticketId,
        title: g.title,
        category: g.category,
        status: g.status,
        zone: g.zone,
        landmark: g.landmark,
        assignedDepartment: g.assignedDepartment,
        upvotes: g.upvotes || 0,
        createdAt: g.createdAt,
        images: g.images,
        lat,
        lng
      };
    });

    res.json({ count: mapped.length, grievances: mapped });
  } catch (err) {
    console.error("Map data error:", err);
    res.status(500).json({ message: "Failed to fetch map data" });
  }
};

// Notifications for current logged-in citizen
const getNotifications = async (req, res) => {
  try {
    const notifications = await CitizenNotification.find({ citizen: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await CitizenNotification.countDocuments({
      citizen: req.user._id,
      read: false
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await CitizenNotification.findOneAndUpdate(
      { _id: id, citizen: req.user._id },
      { read: true }
    );
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await CitizenNotification.updateMany(
      { citizen: req.user._id, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

module.exports = {
  submitGrievance,
  trackGrievance,
  getMyGrievances,
  getPublicStats,
  rateGrievance,
  reopenGrievance,
  upvoteGrievance,
  getMapGrievances,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
