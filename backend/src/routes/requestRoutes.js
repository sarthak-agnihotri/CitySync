
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  submitRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  returnResource,
  cancelRequest
} = require("../controllers/requestController");

// All request routes require authentication
router.use(authMiddleware);

// POST /api/requests — any authenticated user can submit a request
router.post("/", submitRequest);

// GET /api/requests — list requests (filtered by role inside controller)
router.get("/", getAllRequests);

// GET /api/requests/:id — view a single request
router.get("/:id", getRequestById);

// PATCH /api/requests/:id/approve — admins and department heads can approve
router.patch(
  "/:id/approve",
  roleMiddleware("city_admin", "department_head"),
  approveRequest
);

// PATCH /api/requests/:id/reject — admins and department heads can reject
router.patch(
  "/:id/reject",
  roleMiddleware("city_admin", "department_head"),
  rejectRequest
);

// PATCH /api/requests/:id/return — mark resource as returned
router.patch(
  "/:id/return",
  roleMiddleware("city_admin", "department_head"),
  returnResource
);

// PATCH /api/requests/:id/cancel — requester or admin can cancel pending request
router.patch("/:id/cancel", cancelRequest);

module.exports = router;
