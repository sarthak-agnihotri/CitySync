require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User");
const Department = require("./src/models/Department");
const Resource = require("./src/models/Resource");
const Project = require("./src/models/Project");
const Conflict = require("./src/models/Conflict");
const { detectAndRecordConflicts } = require("./src/utils/conflictDetector");

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/Citysync";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data for fresh test run
    await User.deleteMany({});
    await Department.deleteMany({});
    await Resource.deleteMany({});
    await Project.deleteMany({});
    await Conflict.deleteMany({});

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
      name: "Municipal Commissioner (Admin)",
      email: "admin@citysync.gov",
      password: hashedAdminPwd,
      role: "city_admin"
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
      name: "Amit Sharma (Field Officer)",
      email: "officer@citysync.gov",
      password: hashedOfficerPwd,
      role: "officer",
      department: pwdDept._id
    });

    console.log("Created 4 users (Admin, 2 Dept Heads, 1 Officer).");

    // 3. Create Sample Resources
    await Resource.create([
      {
        name: "Caterpillar Hydraulic Excavator 320D",
        category: "equipment",
        description: "Heavy tracked excavator for road cutting and earthmoving",
        quantity: 4,
        availableQuantity: 4,
        unit: "units",
        ownerDepartment: pwdDept._id,
        location: "Central PWD Yard, Ring Road",
        tags: ["excavator", "heavy_machinery", "earthmoving"]
      },
      {
        name: "Vögele Asphalt Paver Super 1800",
        category: "equipment",
        description: "Tracked asphalt paver with high-compaction screed",
        quantity: 2,
        availableQuantity: 2,
        unit: "units",
        ownerDepartment: pwdDept._id,
        location: "South PWD Depot",
        tags: ["asphalt", "road_paving"]
      },
      {
        name: "Submersible De-watering Pump 50HP",
        category: "equipment",
        description: "High discharge slurry and water extraction pump",
        quantity: 8,
        availableQuantity: 8,
        unit: "units",
        ownerDepartment: waterDept._id,
        location: "Water Board Store, Sector 4",
        tags: ["pump", "drainage", "flood_control"]
      },
      {
        name: "Horizontal Directional Drilling (HDD) Rig",
        category: "equipment",
        description: "Trenchless technology rig for underground pipe/cable laying",
        quantity: 3,
        availableQuantity: 3,
        unit: "units",
        ownerDepartment: waterDept._id,
        location: "East Division Yard",
        tags: ["hdd", "trenchless", "pipeline"]
      }
    ]);

    console.log("Created 4 sample shared resources.");

    // 4. Create Sample Projects to demonstrate Conflict Detection
    // Project 1: PWD Road Resurfacing on MG Road (May 1 -> June 30)
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

    // Project 2: Water Board Trunk Pipeline on the EXACT same corridor (May 15 -> July 15)
    // Distance ~150 meters, overlapping dates -> Should trigger CRITICAL conflict!
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
