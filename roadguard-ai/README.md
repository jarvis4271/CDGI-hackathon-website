# RoadGuard AI (PotholeWatch)

> **AI-Powered Civic Road Surface Monitoring & Automated Repair Dispatch System**

A modern civic-tech platform that combines computer vision AI pothole detection, GPS telemetry, community verification, and municipal road-maintenance work order dispatching.

---

## 🌟 Key Features

### 1. Citizen Portal & Interactive Telemetry Map (`index.html`)
- **Interactive Geospatial Map**: Powered by Leaflet.js with dark-themed tiles and high-contrast color-coded hazard markers:
  - 🔴 **Red (Pulsing)**: High severity / dangerous deep craters
  - 🟡 **Amber**: Medium surface ruts
  - 🟢 **Green**: Low severity surface cracks
  - 🔵 **Blue**: Completed & certified road repairs
- **AI Computer Vision Pothole Scanner**:
  - Simulated neural network scan with an animated laser detection beam
  - Instant YOLOv8-style bounding box detection with confidence scoring (e.g. 96.4%) and physical dimension estimation (width/depth)
  - Preset test samples (Deep crater, medium rut, alligator crack) or upload custom road photos
- **Real-Time GPS Geo-Tagging**: Auto-detects device GPS or lets citizens pin directly on the map.
- **Smart Duplicate Merging (<30m)**: Automatically identifies if a pothole has already been registered nearby, merging report logs and boosting community priority.
- **Citizen Engagement & Verification**: Upvoting ("Confirm Hazard +1"), civic repair sign-off, and discussion comments feed.

### 2. Municipal & Government Dispatch Dashboard (`admin.html`)
- **Executive KPIs**: Real-time counts of total incidents, critical hazards, active repair units, and verified completions.
- **Interactive Analytics (Chart.js)**:
  - Incident breakdown by AI Severity classification (Doughnut Chart)
  - Work order lifecycle pipeline (Bar Chart)
- **Active Crew Fleet Management**: Live status of maintenance units (e.g. *Metro Asphalt Crew #1*, *Rapid Patch Unit #4*).
- **Incident Management Table**:
  - Filter by status and severity
  - Real-time crew dispatch modal
  - Status progression (Reported → Under Review → Assigned → In Progress → Repaired)
  - Completion verification modal with before & after photo sign-off
- **Data Export**: Instant export of all tracked incidents to CSV for municipal reporting.

---

## 🚀 Quick Start / How to Run

Since RoadGuard AI is built with modern vanilla JavaScript, Tailwind CSS, Leaflet, and Chart.js, no compilation is required.

### Option 1: Open Directly in Any Web Browser
Simply double-click:
```
C:\Users\dharm\.gemini\antigravity\scratch\roadguard-ai\index.html
```
or open `admin.html` to access the municipal dashboard.

### Option 2: Run with Python Local HTTP Server
In PowerShell:
```powershell
cd C:\Users\dharm\.gemini\antigravity\scratch\roadguard-ai
python -m http.server 8080
```
Then visit:
- **Citizen Portal**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
- **Government Dashboard**: [http://localhost:8080/admin.html](http://localhost:8080/admin.html)

---

## 📁 Project Architecture
```
roadguard-ai/
│
├── index.html        # Citizen portal, interactive Leaflet map, and AI Scanner
├── admin.html        # Municipal administration, work orders, charts, and dispatch
├── app.js            # Client-side map logic, bounding box scanner, and events
├── admin.js          # Municipal dashboard logic, Chart.js graphs, and dispatching
├── data.js           # Shared data store, mock database, and localStorage sync
├── styles.css        # Custom radar pulses, AI laser beam, and glassmorphism styling
└── README.md         # Project documentation and guide
```
