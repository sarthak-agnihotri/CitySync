
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getAuditLogs } = require("../controllers/auditController");

// GET /api/audit — city admins only
router.get(
  "/",
  authMiddleware,
  roleMiddleware("city_admin"),
  getAuditLogs
);

module.exports = router;
