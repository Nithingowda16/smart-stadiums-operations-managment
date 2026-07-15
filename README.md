# FIFA ONE AI — Smart Stadium Operations & Management System

An interactive, real-time visionOS-styled stadium operating system designed for the FIFA World Cup 2026. This platform offers multi-role portals (Fans, Volunteers, Security, Medical, Organizers, and Admins) to handle stadium navigation, emergency beacon dispatching, express food concessions, and carbon-neutral green indices.

---

## 🚀 Key Features

* **Dynamic Island Alerts**: Real-time notifications for stadium security alerts, medical emergencies, and operations updates.
* **Smart Wayfinding**: A pathfinder using SVG node maps, supporting wheelchair accessibility and voice synthesis guidance.
* **Express Concessions & Tracking**: Real-time food prep line tracking, queue wait times, and delivery delay notifications.
* **Stadium Sustainability Portal**: Live tracking of solar grid generation, rainwater capture telemetry, dining compost rates, and transit carbon offset metrics.
* **Role-Based Portals**:
  * **Fans**: Interactive tickets, concessions, wayfinding, and SOS emergency beacons.
  * **Volunteers**: Active task logs and advisory updates.
  * **Organizers**: Emergency response routing, ticket stats, and security logs.
  * **Security & Medical Staff**: Real-time alert response monitors and incident logging.
  * **Admins**: Core sqlite database diagnostics and audit logging.

---

## 🛠️ Tech Stack

### Frontend (React Client)
* **Vite** + **TypeScript** + **React 18**
* **TailwindCSS** (Custom visionOS blur and premium glassmorphism themes)
* **Lucide React** (Vector iconography)

### Backend (Python Server)
* **FastAPI** (High-performance API)
* **WebSockets** (Real-time telemetry syncing)
* **SQLAlchemy** + **SQLite** (Local operations logging)

---

## 💻 Local Quick Start

To launch the backend server and frontend client simultaneously on Windows:

1. Double-click the launcher script at the root of the project:
   ```bash
   ./run.bat
   ```
2. The launcher will:
   * Initialize a Python virtual environment and install packages (`backend/requirements.txt`).
   * Download and prepare React dependencies (`frontend/package.json`).
   * Start the backend on `http://127.0.0.1:8000` and the React dev server on `http://localhost:5173`.
   * Automatically launch your default browser.

---

## ☁️ Render Production Deployment

### 1. Backend Web Service
* **Name**: `smart-stadium-backend`
* **Root Directory**: `backend`
* **Build Command**: `pip install -r requirements.txt`
* **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 2. Frontend Static Site
* **Name**: `smart-stadium-frontend`
* **Root Directory**: `frontend`
* **Build Command**: `npm install && npx vite build`
* **Publish Directory**: `dist`
* **Environment Variables**:
  * `VITE_API_URL` = `https://your-backend-service-url.onrender.com`
  * `VITE_WS_URL` = `wss://your-backend-service-url.onrender.com`
