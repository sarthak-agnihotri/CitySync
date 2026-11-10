const Grievance = require("../models/Grievance");

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

const generateTicketId = async () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const ticket = `GRV-${year}-${randomNum}`;
  const exists = await Grievance.findOne({ ticketId: ticket });
  if (exists) return generateTicketId();
  return ticket;
};

// Submit a grievance (public with or without citizen login)
const submitGrievance = async (req, res) => {
  try {
    const {
      citizenName,
      citizenPhone,
      citizenEmail,
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

    const name = req.user ? req.user.name : citizenName || "Concerned Citizen";
    const phone = req.user ? req.user.phone : citizenPhone || "";
    const email = req.user ? req.user.email : citizenEmail || "";

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

    const grievance = await Grievance.create({
      ticketId,
      citizen: req.user ? req.user._id : null,
      citizenName: name,
      citizenPhone: phone,
      citizenEmail: email,
      category,
      title: title.trim(),
      description: description.trim(),
      zone: zone.trim(),
      landmark: landmark ? landmark.trim() : "",
      coordinates: {
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      },
      images,
      assignedDepartment,
      status: "submitted",
      priority: category === "pothole" || category === "water_leakage" ? "high" : "medium"
    });

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
    const inProgress = await Grievance.countDocuments({ status: { $in: ["under_review", "assigned_to_dept", "in_progress"] } });
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

module.exports = {
  submitGrievance,
  trackGrievance,
  getMyGrievances,
  getPublicStats
};

