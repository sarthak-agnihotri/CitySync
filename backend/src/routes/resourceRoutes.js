
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deactivateResource
} = require("../controllers/resourceController");

// All resource routes require authentication
router.use(authMiddleware);

// GET /api/resources — any authenticated user can view inventory
router.get("/", getAllResources);

// GET /api/resources/:id — view a single resource
router.get("/:id", getResourceById);

// POST /api/resources — only city_admin or department_head can add resources
router.post(
  "/",
  roleMiddleware("city_admin", "department_head"),
  createResource
);

// PUT /api/resources/:id — update a resource
router.put(
  "/:id",
  roleMiddleware("city_admin", "department_head"),
  updateResource
);

// PATCH /api/resources/:id/deactivate — soft-delete a resource
router.patch(
  "/:id/deactivate",
  roleMiddleware("city_admin"),
  deactivateResource
);

module.exports = router;
