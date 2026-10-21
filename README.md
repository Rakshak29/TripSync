# TripSync ✈️🌍

TripSync is a modern, responsive trip planning and travel management web application built with React and Vite. It empowers travelers to discover curated destinations, organize detailed day-by-day itineraries, track expenses against budgets, manage travel bookings, and collaborate seamlessly on upcoming adventures.

---

## 🌟 Current Features

### 1. 🧭 Discover Places & Recommendation Engine
- **Preference Questionnaire**: Filter destinations by duration (or custom days), travel group type (Solo, Couple, Family, Friends, Religious), multi-select experiences, budget tiers, and travel moods.
- **Curated Indian Destinations**: 40 domestic destinations spanning Mountains, Beaches, Waterfalls, Heritage & Culture, Spiritual retreats, Wildlife sanctuaries, Trekking routes, and more.
- **Rule-Based Matching Algorithm**: Scores and ranks destinations based on duration compatibility, group suitability, experience affinity, and travel vibes.
- **Text-First Details View**: Modal showcasing comprehensive destination overviews, key highlights, best time to visit, and local travel tips.
- **Integrated Actions**:
  - **Save to Wishlist**: Save recommendations with duplicate detection, status badges, and user-isolated persistence.
  - **Plan a Trip**: Seamlessly transition from discovery to the trip creation flow with destination prefilled.

### 2. 🗂️ Trip Dashboard & Workspace
- **Dashboard Overview**: Central hub displaying active trips, upcoming journeys, trip countdowns, and quick actions.
- **Dedicated Trip Workspace**: Tabbed interface for deep trip organization:
  - **Overview**: Trip summary, quick stats, editable Additional Notes, and an interactive Trip To-Do List.
  - **Itinerary**: Day-by-day schedule with timed activities, category tags, and notes.
  - **Budget & Expenses**: Budget tracker with category breakdowns (Accommodation, Transport, Food, Activities, Misc), real-time spend calculations, and balance tracking.
  - **Bookings & Logistics**: Structured management for flights, hotels/stays, trains/buses, and activity tickets with booking references and dates.

### 3. 💖 Destination Wishlist
- User-specific wishlist for bookmarking dream destinations.
- Add notes, inspect saved locations, and launch trip creation directly from wishlist items.
- Full localStorage persistence scoped by user account with zero cross-user leakage.

### 4. 🔐 Authentication & Session Flow
- Client-side authentication supporting user registration, login, and secure session management.
- User data isolation ensuring each traveler sees only their own trips, wishlists, and preferences.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Modular Vanilla CSS with custom design tokens and dark-mode aesthetic
- **Routing**: Lightweight client-side router context
- **Code Quality**: ESLint with React Hooks rules

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- `npm` (bundled with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Rakshak29/TripSync.git
   cd TripSync
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the local development server with hot module replacement (HMR):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite frontend development server (`http://localhost:5173`) |
| `npm run server` | Starts the Express backend server (`http://localhost:5001`) |
| `npm run server:dev` | Starts the Express backend server with Node `--watch` reload |
| `npm run build` | Builds the production bundle into the `dist/` directory |
| `npm run preview` | Locally previews the production build |
| `npm run lint` | Runs ESLint to check for code quality and hook rules |
| `npm test` | Executes the automated test suites (frontend + backend) |

---

## 🖥️ Backend & Database Setup (Milestones 10 & 11)

The TripSync backend is built using **Node.js**, **Express**, and **Mongoose**. It provides the server foundation for TripSync's REST APIs, environment configuration, CORS security, centralized error handling, and cloud database connectivity with **MongoDB Atlas**.

### 1. Backend & Database Purpose
- **Node.js & Express**: Exposes a lightweight, reliable REST server with CORS restricted to the frontend (`http://localhost:5173`).
- **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js. It manages connection pooling, schema enforcement, and seamless database interactions.
- **Health Check (`GET /api/health`)**: Monitors both the Express server process and live MongoDB connectivity without requiring authentication.

### 2. Install Backend Dependencies

From the project root:
```bash
npm --prefix backend install
```
*(Or navigate into the directory: `cd backend && npm install`)*

### 3. Environment Configuration

Copy the sample environment template:
```bash
cp backend/.env.example backend/.env
```

| Variable | Default / Example | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | Server listening port (5001 avoids macOS AirPlay collision on 5000) |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Frontend URL permitted by CORS |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.abc.mongodb.net/tripsync` | MongoDB Atlas (or local) connection string |

> **Security Note**: Actual `.env` files are ignored by Git. Never commit real credentials, passwords, or connection strings. Each developer maintains their own local `backend/.env`.

---

### 4. Setting Up MongoDB Atlas (Recommended Cloud Database)

To connect TripSync to a shared cloud database:

1. **Sign Up / Log In**: Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. **Create a Free Cluster**:
   - Click **"Create"** and select the free **M0 Shared** tier.
   - Choose a cloud provider and region close to you (e.g., AWS / Mumbai `ap-south-1`).
   - Click **"Create Deployment"**.
3. **Create Database Credentials**:
   - In **Security** → **Database Access**, click **"Add New Database User"**.
   - Select **Password** authentication method.
   - Enter a username (e.g., `tripsync_user`) and a secure password.
   - Set user privileges to **"Read and write to any database"** (or Atlas admin).
   - Click **"Add User"**.
4. **Configure Network Access**:
   - In **Security** → **Network Access**, click **"Add IP Address"**.
   - For local development, click **"Allow Access from Anywhere"** (`0.0.0.0/0`) or choose **"Add Current IP Address"**.
   - Confirm to save.
5. **Get Your Connection String**:
   - Go to **Database** → **Deployments** and click **"Connect"** on your cluster.
   - Choose **"Drivers"** (Node.js).
   - Copy the connection string format:
     `mongodb+srv://<username>:<password>@<cluster-url>/tripsync?retryWrites=true&w=majority`
6. **Configure `backend/.env`**:
   - Paste the connection string into your local `backend/.env` as `MONGODB_URI`.
   - Replace `<username>` and `<password>` with your real database user credentials.

*(Note: If `MONGODB_URI` is omitted or empty, the backend boots safely in disconnected offline mode, allowing server health checks to run without crashing).*

---

### 5. Start the Backend Server

- **Production / Standard Mode**:
  ```bash
  npm run server
  # Or: cd backend && npm start
  ```
- **Development Watch Mode** (auto-reloads on file changes):
  ```bash
  npm run server:dev
  # Or: cd backend && npm run dev
  ```

### 6. Test the Health Endpoint

With the server running on `http://localhost:5001`:

```bash
curl http://localhost:5001/api/health
```

**Response with MongoDB Connected**:
```json
{
  "status": "ok",
  "message": "TripSync backend is running",
  "timestamp": "2026-10-18T14:45:00.000Z",
  "uptime": 24,
  "database": {
    "status": "connected",
    "connected": true,
    "host": "cluster0.abc.mongodb.net"
  }
}
```

**Response in Disconnected / Offline Mode**:
```json
{
  "status": "ok",
  "message": "TripSync backend is running",
  "timestamp": "2026-10-18T14:45:00.000Z",
  "uptime": 24,
  "database": {
    "status": "disconnected",
    "connected": false,
    "host": null
  }
}
```

Testing an unknown route:
```bash
curl http://localhost:5001/api/unknown
# Returns HTTP 404: {"status":"error","message":"Route not found: GET /api/unknown"}
```

---

## 🧳 Trip Management API (Milestone 12)

Milestone 12 implements persistent trip data modeling and CRUD REST APIs using Express and Mongoose.

> **Development Notice**: These endpoints are currently **unauthenticated** development routes. User authentication (JWT/session-based) and user ownership will be integrated in a later milestone. These endpoints are not yet secured for production multi-tenant use.

### 1. Trip Model Schema Fields

| Field | Type | Required | Constraints / Validation |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Trimmed, max 100 characters |
| `destination` | String | Yes | Trimmed, max 100 characters |
| `startDate` | Date | Yes | Valid date |
| `endDate` | Date | Yes | Valid date, must be on or after `startDate` |
| `travelers` | Number | Yes | Integer between `1` and `50` (default: 1) |
| `budget` | Number | Yes | Total estimated budget in INR, must be `> 0` |
| `notes` | String | No | Trimmed, max 2000 characters (default: `""`) |
| `createdAt` | Date | Auto | ISO timestamp generated by Mongoose |
| `updatedAt` | Date | Auto | ISO timestamp updated on modification |

---

### 2. Available Endpoints

#### A. Create a Trip (`POST /api/trips`)
- **Request Body**:
  ```json
  {
    "name": "Golden Triangle Tour",
    "destination": "Jaipur",
    "startDate": "2026-11-10",
    "endDate": "2026-11-15",
    "travelers": 3,
    "budget": 55000,
    "notes": "Visit Amber Fort and Hawa Mahal."
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "status": "ok",
    "message": "Trip created successfully",
    "data": {
      "_id": "6716bc5987cfbac92b38dff1",
      "name": "Golden Triangle Tour",
      "destination": "Jaipur",
      "startDate": "2026-11-10T00:00:00.000Z",
      "endDate": "2026-11-15T00:00:00.000Z",
      "travelers": 3,
      "budget": 55000,
      "notes": "Visit Amber Fort and Hawa Mahal.",
      "createdAt": "2026-10-21T18:00:00.000Z",
      "updatedAt": "2026-10-21T18:00:00.000Z"
    }
  }
  ```

#### B. List All Trips (`GET /api/trips`)
- **Query Parameters**: Optional `?limit=50` (max 100, default: 50). Ordered by newest `createdAt` first.
- **Response (`200 OK`)**:
  ```json
  {
    "status": "ok",
    "count": 1,
    "data": [
      {
        "_id": "6716bc5987cfbac92b38dff1",
        "name": "Golden Triangle Tour",
        "destination": "Jaipur",
        "startDate": "2026-11-10T00:00:00.000Z",
        "endDate": "2026-11-15T00:00:00.000Z",
        "travelers": 3,
        "budget": 55000
      }
    ]
  }
  ```

#### C. Get Trip by ID (`GET /api/trips/:id`)
- **Response (`200 OK`)**: Returns single trip in `data`.
- **Error Codes**:
  - `400 Bad Request`: If `:id` is not a valid 24-character hex ObjectId (`{"status":"error","message":"Invalid trip ID format"}`).
  - `404 Not Found`: If trip with given ID does not exist (`{"status":"error","message":"Trip not found with ID"}`).

#### D. Update Trip (`PATCH /api/trips/:id`)
- Permitted fields: `name`, `destination`, `startDate`, `endDate`, `travelers`, `budget`, `notes`.
- Disallows updating immutable fields such as `_id`.
- **Request Body**:
  ```json
  {
    "budget": 62000,
    "travelers": 4
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "status": "ok",
    "message": "Trip updated successfully",
    "data": { ... }
  }
  ```

#### E. Delete Trip (`DELETE /api/trips/:id`)
- **Response (`200 OK`)**:
  ```json
  {
    "status": "ok",
    "message": "Trip deleted successfully",
    "data": { "id": "6716bc5987cfbac92b38dff1" }
  }
  ```

---

## 🧪 Testing

TripSync includes automated test suites covering core business logic and backend endpoints:

```bash
npm test
```

Test coverage includes:
- **Trip Data Models & REST APIs (Milestone 12)**: Validates Mongoose schema constraints (name/dest requirements, positive budget, integer travelers, date ranges), CRUD endpoint responses (POST 201, GET 200, PATCH 200, DELETE 200), and invalid ID (400) / nonexistent (404) error handling.
- **Database Connection & Health (Milestone 11)**: Validates Mongoose connection lifecycle, missing URI handling, database status in `/api/health`, sanitized connection string logging, and offline mode.
- **Backend Foundation (Milestone 10)**: Validates `GET /api/health` status 200, unknown route 404 handling, CORS origin headers, `.env.example` template, and `.gitignore` safety.
- **Discover Places Actions**: Verifies Wishlist saving, deduplication, reload persistence, user isolation, and "Plan a Trip" form prefilling.
- **Destination Dataset Integrity**: Validates schema compliance, domestic Indian boundaries, tag constraints, and thematic category coverage across all 40 destinations.
- **Recommendation & Matching Rules**: Evaluates duration tier mapping, multi-attribute scoring, ranking, and edge-case handling (including incompatible empty states).
- **Text-First Visual Rules**: Verifies image-free rendering compliance for lightweight, accessible discovery cards and modals.

---

## 📁 Project Structure

```text
TripSync/
├── backend/                # Node.js + Express backend foundation
│   ├── src/
│   │   ├── config/         # Database connection module (db.js)
│   │   ├── controllers/    # Request controllers (tripController.js)
│   │   ├── middleware/     # 404 notFoundHandler and global errorHandler
│   │   ├── models/         # Mongoose schemas (Trip.js)
│   │   ├── routes/         # Express API routes (healthRoutes.js, tripRoutes.js)
│   │   ├── app.js          # Express app configuration & middleware
│   │   └── server.js       # Server entrypoint and port listener
│   ├── .env.example        # Environment variable template
│   └── package.json        # Backend dependencies (express, cors, dotenv, mongoose)
├── public/                 # Static assets (favicons, SVG icons)
├── src/
│   ├── assets/             # Project images and SVG assets
│   ├── components/         # Reusable UI components (Button, PageContainer, CompassLogo)
│   ├── context/            # Context providers (Auth, Trip, Wishlist, Router)
│   ├── data/               # Curated destination dataset & recommendation algorithm
│   ├── pages/              # Main route views (Landing, Auth, Dashboard, Workspace, Discover, Wishlist)
│   ├── utils/              # Data manipulation and calculation helpers
│   ├── App.jsx             # Main application layout and routing switch
│   ├── index.css           # Global design system tokens and base styles
│   └── main.jsx            # React root mount
├── tests/                  # Automated verification test suites (frontend & backend)
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── package.json            # Project manifest & root convenience scripts
└── vite.config.js          # Vite bundler configuration
```

---

## 📄 License

This project is private and developed for academic and portfolio demonstration.
