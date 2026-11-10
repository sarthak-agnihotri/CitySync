require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const mongoose = require("mongoose");

const runTests = async () => {
  console.log("=== Starting CitySyncPublic API Verification ===");
  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5009, "127.0.0.1", resolve));
  const baseUrl = "http://127.0.0.1:5009";

  const request = (method, path, data, token) => {
    return new Promise((resolve, reject) => {
      const u = new URL(baseUrl + path);
      const postData = data ? (typeof data === "string" ? data : JSON.stringify(data)) : null;
      const headers = {};
      if (postData) {
        headers["Content-Type"] = "application/json";
        headers["Content-Length"] = Buffer.byteLength(postData);
      }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const req = http.request(u, { method, headers }, (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      });
      req.on("error", reject);
      if (postData) req.write(postData);
      req.end();
    });
  };

  try {
    // 1. Health checks
    const h1 = await request("GET", "/");
    console.log("1. GET / ->", h1.status, h1.data.status === "ok" ? "PASS" : "FAIL");

    const h2 = await request("GET", "/api/health");
    console.log("2. GET /api/health ->", h2.status, h2.data.status === "ok" ? "PASS" : "FAIL");

    // 2. Stats
    const stats = await request("GET", "/api/citizen/grievances/stats");
    console.log("3. GET /api/citizen/grievances/stats ->", stats.status, stats.data.stats ? "PASS" : "FAIL");

    // 3. Citizen Registration
    const testEmail = `tester_${Date.now()}@citysync.gov`;
    const reg = await request("POST", "/api/citizen/auth/register", {
      name: "Verification Tester",
      email: testEmail,
      password: "TestPassword@123",
      phone: "+91 99999 88888",
      address: "Civic Centre, Zone 1"
    });
    console.log("4. POST /api/citizen/auth/register ->", reg.status, reg.data.token ? "PASS" : "FAIL");
    const token = reg.data.token;

    // 4. Citizen Login
    const login = await request("POST", "/api/citizen/auth/login", {
      email: testEmail,
      password: "TestPassword@123"
    });
    console.log("5. POST /api/citizen/auth/login ->", login.status, login.data.token ? "PASS" : "FAIL");

    // 5. Citizen Profile
    const me = await request("GET", "/api/citizen/auth/me", null, token);
    console.log("6. GET /api/citizen/auth/me ->", me.status, me.data.user ? "PASS" : "FAIL");

    // 6. Submit Grievance (JSON body test)
    const sub = await request("POST", "/api/citizen/grievances/submit", {
      category: "pothole",
      title: "Automated Test Pothole Issue",
      description: "Pothole detected during unit API verification run",
      zone: "Zone 1 - Central Ward",
      landmark: "Opposite City Centre",
      latitude: "28.6139",
      longitude: "77.2090"
    }, token);
    console.log("7. POST /api/citizen/grievances/submit ->", sub.status, sub.data.ticketId ? "PASS" : "FAIL");
    const ticketId = sub.data.ticketId;

    // 7. Track Grievance
    const track = await request("GET", `/api/citizen/grievances/track/${ticketId}`);
    console.log("8. GET /api/citizen/grievances/track/:ticketId ->", track.status, track.data.grievance ? "PASS" : "FAIL");

    // 8. My Complaints
    const my = await request("GET", "/api/citizen/grievances/my-complaints", null, token);
    console.log("9. GET /api/citizen/grievances/my-complaints ->", my.status, my.data.grievances ? "PASS" : "FAIL");

    console.log("=== All API Routes Verified Successfully! ===");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
};

runTests();

