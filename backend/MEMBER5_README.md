# CitySync — Member 5: Resource Sharing & Notifications

## 1. Module Overview

This module adds **Resource Sharing** and a **Notification System** to the CitySync inter-departmental platform.

It allows departments to:
- Maintain a shared **resource/equipment inventory**
- Submit, approve, reject, and track **resource requests**
- Receive **real-time notifications** about requests, conflicts, and deadlines
- Maintain full **audit logs** of all resource-related activity

---

## 2. My Contribution (Member 5)

| Responsibility | Status |
|---|---|
| Shared equipment and resource inventory (CRUD) | ✅ Done |
| Resource request submission and tracking | ✅ Done |
| Request approval / rejection workflow | ✅ Done |
| Conflict detection (overlapping bookings) | ✅ Done |
| Department notifications (requests, conflicts, deadlines, low inventory) | ✅ Done |
| Audit log records for all actions | ✅ Done |

---

## 3. New Files Added

```text
backend/
├── src/
│   ├── models/
│   │   ├── Resource.js           ← Resource inventory model
│   │   ├── ResourceRequest.js    ← Request lifecycle model
│   │   ├── Notification.js       ← Notification model
│   │   └── AuditLog.js           ← Audit log model
│   ├── controllers/
│   │   ├── resourceController.js
│   │   ├── requestController.js
│   │   ├── notificationController.js
│   │   └── auditController.js
│   ├── routes/
│   │   ├── resourceRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── auditRoutes.js
│   └── utils/
│       └── notifyAudit.js        ← Shared helper for notifications & audit logs
```

---

## 4. API Endpoints

Base URL: `http://localhost:5000`

### 4.1 Resource Inventory

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| GET | `/api/resources` | Authenticated | List all active resources |
| GET | `/api/resources/:id` | Authenticated | Get a single resource |
| POST | `/api/resources` | city_admin / department_head | Create a resource |
| PUT | `/api/resources/:id` | city_admin / department_head | Update a resource |
| PATCH | `/api/resources/:id/deactivate` | city_admin | Soft-delete a resource |

**Create Resource — Example Request Body:**

```json
{
  "name": "Excavator",
  "category": "equipment",
  "description": "Heavy-duty road excavator",
  "quantity": 5,
  "unit": "machines",
  "ownerDepartment": "DEPARTMENT_MONGO_ID",
  "location": "Depot A",
  "tags": ["construction", "roads"]
}
```

Resource categories: `equipment`, `vehicle`, `facility`, `personnel`, `other`

Status is **automatically calculated**:
- `available` — all units free
- `partially_available` — some units in use
- `unavailable` — no units free

**Low inventory alert** is triggered when available < 20% of total.

---

### 4.2 Resource Requests

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| POST | `/api/requests` | Authenticated | Submit a resource request |
| GET | `/api/requests` | Authenticated | List requests (filtered by role) |
| GET | `/api/requests/:id` | Authenticated | Get a single request |
| PATCH | `/api/requests/:id/approve` | city_admin / department_head | Approve a request |
| PATCH | `/api/requests/:id/reject` | city_admin / department_head | Reject a request |
| PATCH | `/api/requests/:id/return` | city_admin / department_head | Mark resource as returned |
| PATCH | `/api/requests/:id/cancel` | Authenticated | Cancel a pending request |

**Submit Request — Example:**

```json
{
  "resourceId": "RESOURCE_MONGO_ID",
  "quantityRequested": 2,
  "purpose": "Road maintenance in Sector 7",
  "startDate": "2026-11-01",
  "endDate": "2026-11-15",
  "priority": "high",
  "notes": "Needed urgently for flyover project"
}
```

Priority levels: `low`, `medium`, `high`, `urgent`

**Role-based visibility:**
- `officer` → sees only their own requests
- `department_head` → sees requests for resources in their department
- `city_admin` → sees all requests

---

### 4.3 Notifications

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| GET | `/api/notifications` | Authenticated | Get my notifications |
| GET | `/api/notifications?unreadOnly=true` | Authenticated | Get only unread |
| PATCH | `/api/notifications/:id/read` | Authenticated | Mark one as read |
| PATCH | `/api/notifications/read-all` | Authenticated | Mark all as read |
| DELETE | `/api/notifications/:id` | Authenticated | Delete a notification |

**Notification types:**

| Type | Trigger |
|---|---|
| `request_submitted` | When any new request is created |
| `request_approved` | When a request is approved |
| `request_rejected` | When a request is rejected |
| `resource_returned` | When resource is returned |
| `resource_conflict` | When a booking overlaps an existing approved one |
| `inventory_low` | When available stock drops below 20% |
| `request_cancelled` | When a request is cancelled |

---

### 4.4 Audit Logs

| Method | Endpoint | Role Required | Description |
|---|---|---|---|
| GET | `/api/audit` | city_admin | Query audit logs |

**Query Parameters:** `action`, `targetType`, `performedBy`, `department`, `startDate`, `endDate`

**Logged actions:** `RESOURCE_CREATED`, `RESOURCE_UPDATED`, `RESOURCE_DEACTIVATED`, `REQUEST_SUBMITTED`, `REQUEST_APPROVED`, `REQUEST_REJECTED`, `RESOURCE_RETURNED`, `REQUEST_CANCELLED`

---

## 5. Authorization Summary

| Action | city_admin | department_head | officer |
|---|---|---|---|
| View resources | ✅ | ✅ | ✅ |
| Create/Update resources | ✅ | ✅ | ❌ |
| Deactivate resources | ✅ | ❌ | ❌ |
| Submit requests | ✅ | ✅ | ✅ |
| Approve / Reject requests | ✅ | ✅ | ❌ |
| Cancel own requests | ✅ | ✅ | ✅ |
| View notifications | ✅ | ✅ | ✅ |
| View audit logs | ✅ | ❌ | ❌ |

---

## 6. Testing Guide (Postman)

1. Login as `city_admin` → copy the JWT token
2. **POST** `/api/resources` — create a resource with a valid department ID
3. Login as `officer` → copy their token
4. **POST** `/api/requests` — submit a request for the resource
5. **GET** `/api/notifications` (officer) — see "Request Submitted" confirmation
6. Switch to `city_admin` token
7. **PATCH** `/api/requests/:id/approve` — approve the request
8. **GET** `/api/notifications` (officer) — see "Request Approved" notification
9. **PATCH** `/api/requests/:id/return` — mark as returned
10. **GET** `/api/audit` (city_admin) — review full audit trail

---

## 7. GitHub Push Guide

```bash
# 1. Open terminal in the project folder
cd C:\Users\kisha\Downloads\CitySync-main\CitySync-main

# 2. Check current status
git status

# 3. Stage all new files
git add .

# 4. Commit with a clear message
git commit -m "feat: Member 5 - Resource Sharing and Notifications module

- Add Resource, ResourceRequest, Notification, AuditLog models
- Add resource inventory CRUD with auto-status and low-inventory alerts
- Add request lifecycle: submit, approve, reject, return, cancel
- Add conflict detection for overlapping bookings
- Add notification system with 8 notification types
- Add audit logging for all resource and request actions
- Register all new routes in app.js"

# 5. Push to GitHub
git push origin main
```

> If your branch is not `main`, replace `main` with your branch name (e.g., `member5`, `dev`, etc.)

---

## 8. Summary

This module provides CitySync with a complete resource management and notification backbone. It integrates cleanly with the existing Auth and Department modules and satisfies all Member 5 deliverables:
- ✅ Shared equipment and resource inventories
- ✅ Resource requests, approvals, and availability tracking
- ✅ Department notifications for conflicts, requests, and deadlines
- ✅ Project activity and audit records
