# CitySyncPublic — Citizen Grievance & Civic Redressal Portal

A dedicated, standalone public portal for citizens to report potholes, broken roads, water pipeline leaks, faulty streetlights, and sanitation issues directly to city administration engineers.

---

## 🏗️ Architecture

- **Path:** `E:\Capstone\CitySyncMain\CitySyncPublic`
- **Frontend (Port 5174):** React 18, Vite, Tailwind CSS, Lucide Icons, Institutional Civic Theme matching CitySync Admin.
- **Backend (Port 5001):** Express 5, Mongoose 9, Multer Image Uploader, JWT Citizen Authentication.
- **Database:** MongoDB (`Citysync` database, dedicated `citizenusers` and `grievances` collections).

---

## 🚀 How to Run

### 1. Run the Public Backend
Open a terminal:
```powershell
cd E:\Capstone\CitySyncMain\CitySyncPublic\backend
npm install
node seed.js    # (Optional: Populates demo complaints and citizen users)
npm run dev     # Runs on http://127.0.0.1:5001
```

### 2. Run the Public Frontend
Open a second terminal:
```powershell
cd E:\Capstone\CitySyncMain\CitySyncPublic\frontend
npm install
npm run dev     # Runs on http://127.0.0.1:5174
```

---

## 🔑 Demo Citizen Credentials (from `seed.js`)

| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Aakash Sharma** | `citizen@citysync.gov` | `Citizen@1234` | Registered Citizen |
| **Pooja Mehta** | `pooja@citysync.gov` | `Citizen@1234` | Registered Citizen |

---

## 🎫 Sample Tracking Tickets
- `GRV-2026-1011` (Pothole at Sector 14 Metro - In Progress)
- `GRV-2026-1012` (Water Pipeline Rupture - Assigned to Water Board)
- `GRV-2026-1013` (Streetlight Outage - Resolved)

---

## 🌐 Features Implemented
1. **Photo Upload with Multer:** Up to 3 images per complaint (JPG/PNG/WebP, max 5MB).
2. **GPS Geo-Pinning:** HTML5 browser location detection or manual zone/landmark entry.
3. **Smart Department Routing:** Categorized directly to PWD, WSSB, DISCOM, or Solid Waste.
4. **Instant Ticket Tracking:** Track resolution status without mandatory login.
5. **My Grievances Portal:** Citizen dashboard showing submission history and repair status.
6. **Theme Support:** Zero-blue Institutional Dark & Light modes matching the main portal.
