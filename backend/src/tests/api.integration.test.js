const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");

test("GET / should return API status", async () => {
  const response = await request(app).get("/");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.message, "CitySync API is live");
});

test("GET /api/health should return backend health status", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.message, "CitySync backend is running");
});

test("GET /api/projects should reject requests without a token", async () => {
  const response = await request(app).get("/api/projects");

  assert.equal(response.status, 401);
  assert.equal(response.body.message, "Authentication token is required");
});

test("GET /api/auth/me should reject requests without a token", async () => {
  const response = await request(app).get("/api/auth/me");

  assert.equal(response.status, 401);
  assert.equal(response.body.message, "Authentication token is required");
});
