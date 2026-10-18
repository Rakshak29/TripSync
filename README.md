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
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Builds the production bundle into the `dist/` directory |
| `npm run preview` | Locally previews the production build |
| `npm run lint` | Runs ESLint to check for code quality and hook rules |
| `npm test` | Executes the automated project test suites |

---

## 🧪 Testing

TripSync includes automated test suites covering core business logic and algorithms:

```bash
npm test
```

Test coverage includes:
- **Discover Places Actions**: Verifies Wishlist saving, deduplication, reload persistence, user isolation, and "Plan a Trip" form prefilling.
- **Destination Dataset Integrity**: Validates schema compliance, domestic Indian boundaries, tag constraints, and thematic category coverage across all 40 destinations.
- **Recommendation & Matching Rules**: Evaluates duration tier mapping, multi-attribute scoring, ranking, and edge-case handling (including incompatible empty states).
- **Text-First Visual Rules**: Verifies image-free rendering compliance for lightweight, accessible discovery cards and modals.

---

## 📁 Project Structure

```text
TripSync/
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
├── tests/                  # Automated verification test suites
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML entry point
├── package.json            # Project manifest & scripts
└── vite.config.js          # Vite bundler configuration
```

---

## 📄 License

This project is private and developed for academic and portfolio demonstration.
