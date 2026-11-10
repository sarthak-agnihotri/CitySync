require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const CitizenUser = require("./src/models/CitizenUser");
const Grievance = require("./src/models/Grievance");

const seedPublicData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Citysync");
    console.log("Connected to MongoDB for CitySyncPublic seeding...");

    await CitizenUser.deleteMany({});
    await Grievance.deleteMany({});
    console.log("Cleared old Citizen and Grievance records.");

    const salt = await bcrypt.genSalt(10);
    const pwd = await bcrypt.hash("Citizen@1234", salt);

    const citizen1 = await CitizenUser.create({
      name: "Aakash Sharma",
      email: "citizen@citysync.gov",
      password: pwd,
      phone: "+91 98765 43210",
      address: "House 42, Sector 14, Urban Estate",
      role: "citizen"
    });

    const citizen2 = await CitizenUser.create({
      name: "Pooja Mehta",
      email: "pooja@citysync.gov",
      password: pwd,
      phone: "+91 91234 56789",
      address: "B-201, Green View Heights, Zone 2",
      role: "citizen"
    });

    console.log("Seeded 2 citizen accounts.");

    await Grievance.create([
      {
        ticketId: "GRV-2026-1011",
        citizen: citizen1._id,
        citizenName: citizen1.name,
        citizenPhone: citizen1.phone,
        citizenEmail: citizen1.email,
        category: "pothole",
        title: "Deep crater-sized pothole near Sector 14 Metro Station",
        description: "A hazardous pothole has formed on the north feeder road right in front of gate no. 2, causing severe traffic jams and two-wheeler skids.",
        zone: "Zone 1 - Central Ward",
        landmark: "Gate No. 2, Sector 14 Metro",
        coordinates: { latitude: 28.6315, longitude: 77.2167 },
        images: [{ url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60", originalName: "pothole_evidence.jpg" }],
        status: "in_progress",
        assignedDepartment: "Public Works Department",
        priority: "critical"
      },
      {
        ticketId: "GRV-2026-1012",
        citizen: citizen2._id,
        citizenName: citizen2.name,
        citizenPhone: citizen2.phone,
        citizenEmail: citizen2.email,
        category: "water_leakage",
        title: "Main drinking water pipeline leak flooding Sector 9 Market",
        description: "Treated potable water line ruptured underground yesterday morning, submerging pedestrian pavement and causing loss of clean water.",
        zone: "Zone 3 - West District",
        landmark: "Opposite Mother Dairy, Sector 9",
        coordinates: { latitude: 28.6289, longitude: 77.2065 },
        images: [{ url: "https://images.unsplash.com/photo-1541888946425-d0fbb1861563?w=800&auto=format&fit=crop&q=60", originalName: "water_leakage.jpg" }],
        status: "assigned_to_dept",
        assignedDepartment: "Water Supply & Sewerage Board",
        priority: "high"
      },
      {
        ticketId: "GRV-2026-1013",
        citizen: null,
        citizenName: "Rohan Verma",
        citizenPhone: "+91 99887 76655",
        citizenEmail: "rohan.v@gmail.com",
        category: "street_light",
        title: "Non-functional streetlights along Outer Ring Road flyover",
        description: "Entire row of 6 streetlights has been out for 4 consecutive nights creating pitch black unsafe driving conditions.",
        zone: "Zone 2 - North Ridge",
        landmark: "Ring Road Pillar #112",
        coordinates: { latitude: 28.6412, longitude: 77.2251 },
        images: [],
        status: "resolved",
        assignedDepartment: "Electricity DISCOM",
        priority: "medium",
        resolutionNotes: "Dispatched crew on 08-Nov-2026; replaced faulty circuit breaker unit.",
        resolvedAt: new Date()
      }
    ]);

    console.log("Seeded sample grievances. Database setup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedPublicData();

