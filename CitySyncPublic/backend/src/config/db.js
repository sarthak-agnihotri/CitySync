const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/citysync");
    console.log(`[CitySyncPublic DB] Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error("[CitySyncPublic DB] Connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

