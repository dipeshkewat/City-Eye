# 🏙️ CityEye — AI-Powered Municipal Infrastructure Monitoring System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_18-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![YOLOv8](https://img.shields.io/badge/AI%2FML-Ultralytics_YOLOv8-FF6F00?style=flat-square&logo=yolo&logoColor=white)](https://ultralytics.com)
[![OpenCV](https://img.shields.io/badge/Computer_Vision-OpenCV_5-5C3EE8?style=flat-square&logo=opencv&logoColor=white)](https://opencv.org)
[![JWT Auth](https://img.shields.io/badge/Security-JWT_%2B_RBAC-black?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

**CityEye** is an automated civic monitoring and incident lifecycle system designed for municipal city corporations. It turns existing street-level and traffic CCTV networks into an active, continuous infrastructure inspection layer. 

By running real-time object detection alongside temporal multi-frame confirmation, CityEye detects **potholes, illegal garbage dumps, and road waterlogging**, verifies them to eliminate false alarms, and automatically routes prioritized work orders with photographic proof to city departments.

---

## 📌 The Problem It Solves

Most cities already operate large networks of CCTV cameras for traffic enforcement and security. However, almost none of that footage is used to maintain civic infrastructure. As a result, municipal response is purely reactive: potholes and road hazards often go unaddressed until citizens file complaints, accidents occur, or roads degrade severely.

CityEye bridges this gap using Computer Vision as an **attention layer**, automating the detection process while keeping final decision-making in the hands of **human municipal officers**.

---

## 🌟 Key Features & Innovations

### 1. 🤖 YOLOv8 Computer Vision Pipeline
* Utilizes **YOLOv8 Nano (`yolov8n.pt`)** fine-tuned for civic defects.
* Runs fast inference on standard edge or server CPUs without requiring high-end GPUs.

### 2. 🔍 CLAHE Low-Light & Contrast Pre-Processing
* Real-world CCTV footage is often grainy, compressed, or shadowed.
* Applies **Contrast Limited Adaptive Histogram Equalization (CLAHE)** on the **Luminance channel in LAB color space** before inference.
* Sharpens crater borders and road textures without causing color distortion or blowing out bright sunlight.

### 3. ⏱️ Single-Camera Multi-Frame Verification (Temporal Tracking)
* Eliminates momentary shadows, passing birds, or compression artifacts.
* Tracks bounding boxes across consecutive frames ($IoU \ge 0.5$).
* A detection is only confirmed after persisting across **$\ge 5$ consecutive frames** in the exact same spatial location.

### 4. 📊 Automated Severity Scoring Engine
Computes a composite priority score using:
$$\text{Severity Score} = (\text{Area Ratio} \times 0.5) + (\text{Temporal Persistence} \times 0.3) + (\text{Confidence} \times 0.2)$$
* **Low:** Score $< 0.35$
* **Medium:** $0.35 \le \text{Score} \le 0.65$
* **High:** Score $> 0.65$

### 5. 👥 3-Tier Role-Based Municipal Workflow (RBAC)
* **👮 Review Officer:** Monitors the priority review queue, inspects evidence photos, approves/rejects incidents, assigns jobs to work teams, and registers cameras.
* **👷 Work Team:** Receives assigned work orders, updates status to *In Progress*, and submits resolution notes and proof-of-fix photos to mark items *Resolved*.
* **📈 Senior Officer:** Executive oversight dashboard with city-wide Leaflet heatmaps, incident breakdown charts, and departmental SLA analytics (read-only).

---

## 🔄 End-to-End Workflow

```text
 CCTV Camera Stream / Video Feed
               │
               ▼
 💡 CLAHE Contrast Pre-Processing (LAB Color Space)
               │
               ▼
 🧠 YOLOv8 Inference (Pothole / Garbage / Road Defects)
               │
               ▼
 ⏱️ Multi-Frame Filter (IoU >= 0.5 across >= 5 frames)
               │
               ▼
 📸 Severity Scoring & Evidence Photo Generation
               │
               ▼
 🗄️ PostgreSQL Database (status: 'pending_officer_review')
               │
               ▼
 👮 Review Officer Dashboard (Inspects -> Approves / Rejects)
               │
               ▼ (Approved)
 👷 Dispatched to Field Work Team ('in_progress' -> 'resolved' with photo proof)
               │
               ▼
 📈 Senior Officer Oversight (Real-time city analytics and GIS mapping)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS | Modular component architecture, dark/light themes, Recharts, Leaflet GIS |
| **Backend** | FastAPI (Python) | High-performance asynchronous REST API, Pydantic v2 schemas |
| **Database** | PostgreSQL 18 + SQLAlchemy 2.0 | Relational database with strict foreign keys, enums, and indexes |
| **Authentication** | JWT (JSON Web Tokens) + Bcrypt | Passlib password hashing, 8-hour shift token expiry, server-side RBAC |
| **AI / Machine Learning** | Ultralytics YOLOv8 Nano, OpenCV | Custom-trained weights (`best.pt`), CLAHE equalization, multi-frame tracking |

---

## 📂 Project Directory Structure

```text
CITYEYE-Dipesh/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/routes/       # Endpoints: auth, reports, cameras, stats
│   │   ├── core/             # Configuration, database session, JWT security
│   │   ├── models/           # SQLAlchemy ORM models (User, Camera, Report)
│   │   ├── schemas/          # Pydantic request and response schemas
│   │   └── main.py           # FastAPI entrypoint, CORS, static routes
│   ├── uploads/              # Storage for evidence and resolution photos
│   ├── requirements.txt      # Python dependencies
│   └── seed.py               # Database initial seeding script
├── frontend/                 # React + Vite Application
│   ├── src/
│   │   ├── auth/             # AuthContext, JWT handling, ProtectedRoute
│   │   ├── components/       # AppLayout, StatusMap, Charts, Action Modals
│   │   ├── context/          # ReportsContext, ThemeContext
│   │   ├── pages/            # Role dashboards (Officer, Work Team, Senior)
│   │   └── api.js            # Native fetch API client
│   └── package.json
├── ml/                       # Machine Learning Pipeline
│   ├── datasets/             # Training datasets (Potholes, Road Damage, Garbage)
│   ├── inference/            # detect.py (video stream processing & ingestion)
│   ├── models/               # best.pt (fine-tuned model weights)
│   ├── pipeline/             # verifier.py, severity.py, preprocessor.py
│   ├── sample_videos/        # Real municipal road video footage
│   └── training/             # train.py and config.yaml
├── files/                    # System Documentation & Specs
│   ├── AGENTS.md             # Engineering & coding rules
│   ├── CityEye_Security_Design.md
│   └── CityEye_Technical_Architecture_Spec.md
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & npm
* **PostgreSQL 14+** (running on port `5432` with a database named `cityeye`)

---

### Step 1: Database Setup
Create the PostgreSQL database and configure credentials:
```sql
CREATE DATABASE cityeye;
```

Ensure `backend/.env` contains your connection string:
```ini
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/cityeye
SECRET_KEY=cityeye-super-secret-jwt-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

---

### Step 2: Backend Setup
```powershell
cd backend
pip install -r requirements.txt

# Run initial database migrations and seed default users
python seed.py

# Start the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
* Interactive API Documentation will be live at: **http://127.0.0.1:8000/docs**

---

### Step 3: Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
* Dashboard will be live at: **http://localhost:5173**

---

### Step 4: Run the AI Detection Pipeline
Process CCTV video footage and auto-report incidents to the dashboard:

```powershell
# Run on real municipal road video footage
python ml/inference/detect.py --source ml/sample_videos/real_pothole_road.mp4 --camera-id cam-002

# Or run an instant verification simulation
python ml/inference/detect.py --simulate --type pothole
```

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **👮 Review Officer** | `officer@cityeye.gov` | `officer123` | Review priority queue, approve/reject, assign work, manage cameras |
| **👷 Work Team** | `vikram@cityeye.gov` | `workteam123` | View assigned repairs, update to in-progress, submit resolution photo |
| **📈 Senior Officer** | `senior@cityeye.gov` | `senior123` | Read-only city-wide GIS maps, analytics, SLA reports |

---

## 🎓 Academic Credit & Author
* **Project Name:** CityEye — Municipal Infrastructure Monitoring System
* **Author:** Dipesh Kewat
* **Project Type:** Final Year Engineering Project
* **Technology:** Computer Vision (YOLOv8 + OpenCV), FastAPI, React, PostgreSQL
