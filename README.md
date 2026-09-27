# Real-Time Space Debris Tracking Dashboard

A modular full-stack dashboard that ingests Space-Track.org satellite/debris data, propagates TLE in near real time, and visualizes active satellites, debris, and collision-risk alerts on a 3D Earth.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, satellite.js, node-cron
- Frontend: React (Vite), Three.js via React Three Fiber, Framer Motion
- Data Source: Space-Track.org authenticated REST API

## Folder Structure

```text
.
|-- backend
|   |-- src
|   |   |-- app.js
|   |   |-- server.js
|   |   |-- config
|   |   |   |-- db.js
|   |   |   `-- env.js
|   |   |-- controllers
|   |   |   `-- object.controller.js
|   |   |-- jobs
|   |   |   `-- sync.job.js
|   |   |-- models
|   |   |   |-- riskAlert.model.js
|   |   |   `-- spaceObject.model.js
|   |   |-- routes
|   |   |   `-- object.routes.js
|   |   |-- services
|   |   |   |-- objectSync.service.js
|   |   |   |-- risk.service.js
|   |   |   `-- spaceTrack.service.js
|   |   `-- utils
|   |       |-- errorHandler.js
|   |       `-- orbit.js
|   |-- .env.example
|   |-- Dockerfile
|   `-- package.json
|-- frontend
|   |-- src
|   |   |-- api/client.js
|   |   |-- hooks/useDashboardData.js
|   |   |-- components
|   |   |   |-- ControlBar.jsx
|   |   |   |-- DashboardPanel.jsx
|   |   |   |-- EarthScene.jsx
|   |   |   `-- ObjectTooltip.jsx
|   |   |-- styles/global.css
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- .env.example
|   |-- Dockerfile
|   |-- index.html
|   `-- package.json
|-- docker-compose.yml
|-- package.json
`-- .gitignore
```

## Backend Features

- Space-Track authentication via `/ajaxauth/login` and session cookie reuse.
- Pulls SATCAT + GP/TLE feeds.
- Converts TLE to orbital position (lat/lon/alt) + velocity with `satellite.js`.
- Classifies objects as `ACTIVE`, `INACTIVE`, `DEBRIS` and orbit class (`LEO`, `MEO`, `GEO`, `HEO`).
- Refreshes every 30 seconds (configurable).
- Collision risk analysis (distance threshold default: 5 km).
- Collision probability score generated from proximity.

## REST API

- `GET /api/objects`
  - Query params: `search`, `orbitClass`, `includeDebris`, `onlyRisk`, `limit`
- `GET /api/debris`
- `GET /api/active`
- `GET /api/risk-analysis`
- `GET /health`

## Frontend Features

- Futuristic neon glassmorphism dashboard.
- 3D rotating Earth with star field.
- Marker system:
  - Active satellites: glowing green dots.
  - Debris: red warning markers.
  - Inactive satellites: yellow markers.
- Hover tooltip: object name, NORAD ID, velocity, altitude, type.
- Search by NORAD ID/object name.
- Orbit filter: LEO/MEO/GEO.
- Debris visibility toggle.
- Side panel with active count, debris count, threshold/risk alerts.
- Auto-refresh every 30 seconds.

## Environment Setup

1. Copy env templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Fill `backend/.env` with valid Space-Track credentials.

Required:
- `MONGO_URI`
- `SPACE_TRACK_USERNAME`
- `SPACE_TRACK_PASSWORD`

## Local Run

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Deployment

### Docker Compose

1. Ensure `backend/.env` is present and valid.
2. Build and run:

```bash
docker compose up --build -d
```

Services:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:4000`
- MongoDB: `localhost:27017`

### Cloud Deployment Notes

- Put backend behind a reverse proxy/API gateway.
- Use managed MongoDB (Atlas, DocumentDB, etc.).
- Store Space-Track secrets in a secret manager.
- Scale backend horizontally; scheduler can be isolated to a worker process.

## Scalability / Modularity

- `services/` isolates integration and domain logic.
- `jobs/` centralizes recurring pipelines.
- `controllers/` + `routes/` keep HTTP layer thin.
- Risk engine and sync engine are independent services and can move to separate workers/microservices.

## Bonus Coverage

Implemented:
- Collision probability scoring.
- Risk orbit highlighting (rings + high-risk markers).

Pluggable extension points:
- Debris density heatmap (frontend layer + backend aggregation endpoint).
- Time simulation/fast-forward (client time controls + server propagation parameter).
