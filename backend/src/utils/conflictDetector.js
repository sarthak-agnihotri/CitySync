const Project = require("../models/Project");
const Conflict = require("../models/Conflict");
const { createNotification } = require("./notifyAudit");
const User = require("../models/User");

/**
 * Check if two date ranges overlap
 * (StartA <= EndB) and (EndA >= StartB)
 */
function hasDateOverlap(projectA, projectB) {
  const startA = new Date(projectA.startDate).getTime();
  const endA = new Date(projectA.endDate).getTime();
  const startB = new Date(projectB.startDate).getTime();
  const endB = new Date(projectB.endDate).getTime();

  return startA <= endB && endA >= startB;
}

/**
 * Calculate distance between two coordinates in meters using Haversine formula
 */
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined
  ) {
    return null;
  }

  const R = 6371000; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Determine severity of a conflict
 */
function evaluateSeverity(distance, projectA, projectB) {
  if (
    projectA.priority === "critical" ||
    projectB.priority === "critical" ||
    (distance !== null && distance <= 150)
  ) {
    return "critical";
  }

  if (distance !== null && distance <= 500) {
    return "high";
  }

  if (projectA.zone && projectB.zone && projectA.zone.toLowerCase() === projectB.zone.toLowerCase()) {
    return "medium";
  }

  return "low";
}

/**
 * Detect conflicts for a project (during create or update)
 */
async function detectAndRecordConflicts(targetProject) {
  // We only check against non-completed, non-cancelled projects
  const activeStatuses = ["proposed", "approved", "in_progress", "delayed"];

  const candidateProjects = await Project.find({
    _id: { $ne: targetProject._id },
    status: { $in: activeStatuses }
  }).populate("department", "name code");

  const detectedConflicts = [];

  for (const other of candidateProjects) {
    const datesOverlap = hasDateOverlap(targetProject, other);
    if (!datesOverlap) continue; // If dates do not overlap, no direct conflict

    let distance = null;
    let hasSpatialOverlap = false;

    if (
      targetProject.coordinates?.latitude !== undefined &&
      targetProject.coordinates?.longitude !== undefined &&
      other.coordinates?.latitude !== undefined &&
      other.coordinates?.longitude !== undefined
    ) {
      distance = calculateDistanceMeters(
        targetProject.coordinates.latitude,
        targetProject.coordinates.longitude,
        other.coordinates.latitude,
        other.coordinates.longitude
      );
      if (distance !== null && distance <= 500) {
        hasSpatialOverlap = true;
      }
    }

    const hasZoneOverlap =
      targetProject.zone &&
      other.zone &&
      targetProject.zone.trim().toLowerCase() === other.zone.trim().toLowerCase();

    if (!hasSpatialOverlap && !hasZoneOverlap) {
      continue;
    }

    let conflictType = "date_overlap";
    if (hasSpatialOverlap) {
      conflictType = "location_and_date_overlap";
    } else if (hasZoneOverlap) {
      conflictType = "zone_overlap";
    }

    const severity = evaluateSeverity(distance, targetProject, other);

    // Standardize order of projectA and projectB to avoid duplicates
    const [pA, pB] =
      targetProject._id.toString() < other._id.toString()
        ? [targetProject, other]
        : [other, targetProject];

    const departmentsInvolved = [];
    if (pA.department) departmentsInvolved.push(pA.department._id || pA.department);
    if (
      pB.department &&
      (pB.department._id || pB.department).toString() !==
        (pA.department._id || pA.department).toString()
    ) {
      departmentsInvolved.push(pB.department._id || pB.department);
    }

    // Upsert conflict record
    let conflict = await Conflict.findOne({
      projectA: pA._id,
      projectB: pB._id,
      status: { $in: ["detected", "under_review"] }
    });

    if (!conflict) {
      conflict = await Conflict.create({
        projectA: pA._id,
        projectB: pB._id,
        departmentsInvolved,
        conflictType,
        severity,
        distanceMeters: distance,
        status: "detected"
      });

      // Notify department heads and admins
      try {
        const admins = await User.find({ role: "city_admin" }).select("_id");
        const deptHeads = await User.find({
          role: "department_head",
          department: { $in: departmentsInvolved }
        }).select("_id department");

        const notifyUserIds = new Set();
        admins.forEach((u) => notifyUserIds.add(u._id.toString()));
        deptHeads.forEach((u) => notifyUserIds.add(u._id.toString()));

        for (const recipientId of notifyUserIds) {
          await createNotification({
            recipient: recipientId,
            type: "project_conflict_detected",
            title: `⚠️ ${severity.toUpperCase()} Conflict Detected`,
            message: `Conflict detected between "${pA.title}" and "${pB.title}". Distance: ${
              distance !== null ? distance + "m" : "Same Zone"
            }.`,
            relatedProject: targetProject._id
          });
        }
      } catch (notifErr) {
        console.error("Conflict notification error:", notifErr.message);
      }
    } else {
      // Update severity & distance if re-evaluated
      conflict.severity = severity;
      conflict.distanceMeters = distance;
      conflict.conflictType = conflictType;
      await conflict.save();
    }

    detectedConflicts.push(conflict);
  }

  return detectedConflicts;
}

/**
 * Dry-run simulation for checking conflicts before creating/updating a project
 */
async function checkConflictsDraft(draftData, excludeProjectId = null) {
  const activeStatuses = ["proposed", "approved", "in_progress", "delayed"];
  const query = { status: { $in: activeStatuses } };
  if (excludeProjectId) {
    query._id = { $ne: excludeProjectId };
  }

  const existingProjects = await Project.find(query).populate(
    "department",
    "name code"
  );

  const potentialConflicts = [];

  for (const other of existingProjects) {
    const datesOverlap = hasDateOverlap(draftData, other);
    if (!datesOverlap) continue;

    let distance = null;
    let hasSpatialOverlap = false;

    if (
      draftData.coordinates?.latitude !== undefined &&
      draftData.coordinates?.longitude !== undefined &&
      other.coordinates?.latitude !== undefined &&
      other.coordinates?.longitude !== undefined
    ) {
      distance = calculateDistanceMeters(
        draftData.coordinates.latitude,
        draftData.coordinates.longitude,
        other.coordinates.latitude,
        other.coordinates.longitude
      );
      if (distance !== null && distance <= 500) {
        hasSpatialOverlap = true;
      }
    }

    const hasZoneOverlap =
      draftData.zone &&
      other.zone &&
      draftData.zone.trim().toLowerCase() === other.zone.trim().toLowerCase();

    if (hasSpatialOverlap || hasZoneOverlap) {
      let conflictType = hasSpatialOverlap
        ? "location_and_date_overlap"
        : "zone_overlap";

      const severity = evaluateSeverity(distance, draftData, other);

      potentialConflicts.push({
        conflictingProject: {
          id: other._id,
          title: other.title,
          department: other.department,
          startDate: other.startDate,
          endDate: other.endDate,
          category: other.category,
          zone: other.zone,
          address: other.address,
          coordinates: other.coordinates
        },
        conflictType,
        severity,
        distanceMeters: distance
      });
    }
  }

  return potentialConflicts;
}

module.exports = {
  hasDateOverlap,
  calculateDistanceMeters,
  detectAndRecordConflicts,
  checkConflictsDraft
};
