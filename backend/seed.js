require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User");
const Department = require("./src/models/Department");
const Resource = require("./src/models/Resource");
const Project = require("./src/models/Project");
const Conflict = require("./src/models/Conflict");
const ResourceRequest = require("./src/models/ResourceRequest");
const Notification = require("./src/models/Notification");
const { detectAndRecordConflicts } = require("./src/utils/conflictDetector");

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/citysync";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data for fresh test run
    await User.deleteMany({});
    await Department.deleteMany({});
    await Resource.deleteMany({});
    await Project.deleteMany({});
    await Conflict.deleteMany({});
    await ResourceRequest.deleteMany({});
    await Notification.deleteMany({});

    console.log("Cleared old collections.");

    // 1. Create Departments
    const pwdDept = await Department.create({
      name: "Public Works Department",
      code: "PWD",
      description: "Arterial roads, flyovers, and state highways",
      contactEmail: "contact@pwd.citysync.gov",
      location: "Civic Centre, Zone 1"
    });

    const waterDept = await Department.create({
      name: "Water Supply & Sewerage Board",
      code: "WSSB",
      description: "Underground potable pipelines and sewer mains",
      contactEmail: "contact@water.citysync.gov",
      location: "Water House, Sector 4"
    });

    const powerDept = await Department.create({
      name: "Electricity DISCOM",
      code: "DISCOM",
      description: "Overhead/underground power cabling and transformers",
      contactEmail: "contact@discom.citysync.gov",
      location: "Power Bhavan, Zone 2"
    });

    console.log("Created 3 departments.");

    // 2. Create Users
    const hashedAdminPwd = await bcrypt.hash("Admin@1234", 10);
    const hashedHeadPwd = await bcrypt.hash("Head@1234", 10);
    const hashedOfficerPwd = await bcrypt.hash("Officer@1234", 10);

    const adminUser = await User.create({
      name: "Admin CitySync",
      email: "admin@citysync.gov",
      password: hashedAdminPwd,
      role: "city_admin",
      department: pwdDept._id
    });

    const pwdHead = await User.create({
      name: "Rajesh Kumar (PWD Head)",
      email: "pwd_head@citysync.gov",
      password: hashedHeadPwd,
      role: "department_head",
      department: pwdDept._id
    });

    const waterHead = await User.create({
      name: "Sunita Verma (Water Head)",
      email: "water_head@citysync.gov",
      password: hashedHeadPwd,
      role: "department_head",
      department: waterDept._id
    });

    const officer = await User.create({
      name: "Hiralal Mahato (Field Officer)",
      email: "officer@citysync.gov",
      password: hashedOfficerPwd,
      role: "officer",
      department: pwdDept._id
    });

    console.log("Created 4 users (Admin, 2 Dept Heads, 1 Officer).");

    // 3. Create Sample Resources
    const res1 = await Resource.create({
      name: "Caterpillar Hydraulic Excavator 320D",
      category: "equipment",
      description: "Heavy tracked excavator for road cutting and trenching",
      quantity: 4,
      availableQuantity: 3,
      unit: "machines",
      ownerDepartment: pwdDept._id,
      location: "Central PWD Yard, Ring Road",
      status: "available",
      tags: ["excavator", "heavy_machinery", "earthmoving"]
    });

    const res2 = await Resource.create({
      name: "Vögele Asphalt Paver Super 1800",
      category: "equipment",
      description: "Tracked asphalt paver with high-compaction screed",
      quantity: 2,
      availableQuantity: 1,
      unit: "machines",
      ownerDepartment: pwdDept._id,
      location: "South PWD Depot",
      status: "available",
      tags: ["asphalt", "road_paving"]
    });

    const res3 = await Resource.create({
      name: "Submersible De-watering Pump 50HP",
      category: "equipment",
      description: "High discharge slurry and water extraction pump",
      quantity: 8,
      availableQuantity: 8,
      unit: "machines",
      ownerDepartment: waterDept._id,
      location: "Water Board Store, Sector 4",
      status: "available",
      tags: ["pump", "drainage", "flood_control"]
    });

    const res4 = await Resource.create({
      name: "Horizontal Directional Drilling (HDD) Rig",
      category: "equipment",
      description: "Trenchless technology rig for underground pipe/cable laying",
      quantity: 3,
      availableQuantity: 3,
      unit: "machines",
      ownerDepartment: waterDept._id,
      location: "East Division Yard",
      status: "available",
      tags: ["hdd", "trenchless", "pipeline"]
    });

    console.log("Created 4 sample shared resources.");

    // 4. Create Sample Projects to demonstrate Conflict Detection
    const project1 = await Project.create({
      title: "MG Road Transit Corridor Resurfacing",
      description: "Bituminous concrete resurfacing and storm drain clearing",
      department: pwdDept._id,
      createdBy: pwdHead._id,
      category: "roadwork",
      zone: "Zone 1 - Central",
      address: "MG Road, Connaught Place Corridor",
      coordinates: {
        latitude: 28.6315,
        longitude: 77.2167
      },
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-06-30"),
      estimatedBudget: 4500000,
      priority: "high",
      status: "approved"
    });

    const project2 = await Project.create({
      title: "MG Road Potable Water Main Replacement",
      description: "Laying 600mm DI potable water trunk main line",
      department: waterDept._id,
      createdBy: waterHead._id,
      category: "water_sewage",
      zone: "Zone 1 - Central",
      address: "MG Road Outer Circle, Connaught Place",
      coordinates: {
        latitude: 28.6325,
        longitude: 77.2175
      },
      startDate: new Date("2026-05-15"),
      endDate: new Date("2026-07-15"),
      estimatedBudget: 6200000,
      priority: "critical",
      status: "proposed"
    });

    // Detect and record conflicts between the sample projects
    const conflicts = await detectAndRecordConflicts(project2);
    console.log(`Detected and logged ${conflicts.length} conflict(s) between seed projects.`);

    // 5. Create Sample Resource Requisitions
    const req1 = await ResourceRequest.create({
      resource: res1._id,
      requestedBy: officer._id,
      requestingDepartment: pwdDept._id,
      quantityRequested: 1,
      purpose: "Stormwater culvert deep clearing at North Junction",
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-10"),
      priority: "high",
      status: "pending",
      notes: "Heavy machine transport trailer required on site."
    });

    const req2 = await ResourceRequest.create({
      resource: res2._id,
      requestedBy: pwdHead._id,
      requestingDepartment: pwdDept._id,
      quantityRequested: 1,
      purpose: "Expressway bituminous overlay paving section KM 24-28",
      startDate: new Date("2026-10-15"),
      endDate: new Date("2026-10-25"),
      priority: "urgent",
      status: "approved",
      reviewedBy: adminUser._id,
      reviewedAt: new Date("2026-10-14")
    });

    const req3 = await ResourceRequest.create({
      resource: res3._id,
      requestedBy: waterHead._id,
      requestingDepartment: waterDept._id,
      quantityRequested: 2,
      purpose: "Emergency de-watering of water main intake pit",
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-05"),
      priority: "urgent",
      status: "returned",
      reviewedBy: adminUser._id,
      reviewedAt: new Date("2026-09-30")
    });

    console.log("Created 3 sample requisitions (pending, approved, returned).");

    // 6. Create Sample Notifications
    await Notification.create([
      {
        recipient: adminUser._id,
        recipientDepartment: pwdDept._id,
        type: "request_submitted",
        title: "New Resource Requisition",
        message: `Field Officer Hiralal Mahato requested 1 unit of "${res1.name}" for stormwater culvert clearing.`,
        relatedRequest: req1._id,
        relatedResource: res1._id,
        isRead: false
      },
      {
        recipient: adminUser._id,
        recipientDepartment: pwdDept._id,
        type: "project_conflict_detected",
        title: "CRITICAL Spatial Conflict Detected",
        message: `Spatial clash detected between "${project1.title}" and "${project2.title}". Distance: ~140m.`,
        relatedProject: project2._id,
        isRead: false
      },
      {
        recipient: officer._id,
        recipientDepartment: pwdDept._id,
        type: "request_submitted",
        title: "Requisition Confirmation",
        message: `Your requisition for "${res1.name}" has been logged and is awaiting administrative approval.`,
        relatedRequest: req1._id,
        relatedResource: res1._id,
        isRead: false
      }
    ]);

    console.log("Created sample notifications.");

    console.log("\n========================================================");
    console.log("🌱 CitySync Database Seeded Successfully!");
    console.log("========================================================");
    console.log("Sample Login Credentials:");
    console.log("1. City Admin:      admin@citysync.gov      / Admin@1234");
    console.log("2. PWD Head:        pwd_head@citysync.gov   / Head@1234");
    console.log("3. Water Head:      water_head@citysync.gov / Head@1234");
    console.log("4. Field Officer:   officer@citysync.gov    / Officer@1234");
    console.log("========================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
