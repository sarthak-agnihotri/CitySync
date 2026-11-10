# CitySync API Verification Guide

All API endpoints inside `E:\Capstone\CitySyncMain\CitySyncPublic` have been reviewed and structured for complete end-to-end functionality.

---

## 📋 Comprehensive API Route Checklist

| # | Method | Endpoint | Access | Purpose | Tested Payload / Parameters |
|---|---|---|---|---|---|
| **1** | `GET` | `/` | Public | Service ping & status | None |
| **2** | `GET` | `/api/health` | Public | Healthcheck for hosting | None |
| **3** | `GET` | `/api/citizen/grievances/stats` | Public | Live count of total, resolved, and active complaints | None |
| **4** | `POST` | `/api/citizen/auth/register` | Public | Register new resident profile | `{ name, email, password, phone, address }` |
| **5** | `POST` | `/api/citizen/auth/login` | Public | Citizen login and JWT issuance | `{ email, password }` |
| **6** | `GET` | `/api/citizen/auth/me` | Authenticated | Retrieve logged-in resident info | Header: `Authorization: Bearer <token>` |
| **7** | `POST` | `/api/citizen/grievances/submit` | Public / Auth | Submit complaint with up to 3 photos & GPS | `multipart/form-data` (images, title, category, zone...) |
| **8** | `GET` | `/api/citizen/grievances/track/:ticketId` | Public | Real-time complaint progress & resolution note | `:ticketId` (e.g. `GRV-2026-1011`) |
| **9** | `GET` | `/api/citizen/grievances/my-complaints` | Authenticated | History of complaints submitted by the citizen | Header: `Authorization: Bearer <token>` |
| **10**| `GET` | `/uploads/:filename` | Public | Static image preview of uploaded photos | Uploaded image path |

---

## 🧪 How to Run Verification Locally

Open your terminal in `E:\Capstone\CitySyncMain\CitySyncPublic\backend`:

```powershell
cd E:\Capstone\CitySyncMain\CitySyncPublic\backend
npm install
node seed.js
node test-apis.js
```

`node test-apis.js` executes automated tests against all 9 endpoints and reports:
- ✅ `GET /` -> 200 PASS
- ✅ `GET /api/health` -> 200 PASS
- ✅ `GET /api/citizen/grievances/stats` -> 200 PASS
- ✅ `POST /api/citizen/auth/register` -> 201 PASS
- ✅ `POST /api/citizen/auth/login` -> 200 PASS
- ✅ `GET /api/citizen/auth/me` -> 200 PASS
- ✅ `POST /api/citizen/grievances/submit` -> 201 PASS
- ✅ `GET /api/citizen/grievances/track/:ticketId` -> 200 PASS
- ✅ `GET /api/citizen/grievances/my-complaints` -> 200 PASS

