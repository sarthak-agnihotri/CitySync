
const jwt = require("jsonwebtoken");
const CitizenUser = require("../models/CitizenUser");

const citizenAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "citysync_public_citizen_jwt_secret_key_2026");
    const user = await CitizenUser.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Citizen user account not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session token" });
  }
};

const optionalCitizenAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "citysync_public_citizen_jwt_secret_key_2026");
    req.user = await CitizenUser.findById(decoded.userId).select("-password");
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { citizenAuthMiddleware, optionalCitizenAuth };

