<div align="center">

# 📍 YahanHai-

### Real-Time Local Retailer Discovery & Dashboard Platform

[![JavaScript](https://img.shields.io/badge/JavaScript-92.1%25-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS](https://img.shields.io/badge/CSS-7.0%25-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![HTML](https://img.shields.io/badge/HTML-0.9%25-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

> **YahanHai** (यहाँ है) — Hindi for *"It's right here"* — a production-grade, real-time dashboard platform enabling customers to **discover**, **follow**, and **interact** with local retailers based on live location data, with robust authentication, profile management, and analytics.

</div>

---

## 📚 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Data Flow Diagram](#-data-flow-diagram)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Screenshots & UI Overview](#-screenshots--ui-overview)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

**YahanHai-** is a full-stack web application built with Node.js, Express, React, and MongoDB (MERN stack). The platform bridges the gap between local retailers and their customers by providing a live, real-time dashboard where:

- **Customers** can discover local retailers on a map, follow their favorite stores, interact with retailer profiles, and receive live updates.
- **Retailers** can manage their profiles, broadcast their live location, post updates, and track engagement analytics.

The name *YahanHai* (यहाँ है) — meaning "It's right here" in Hindi — perfectly captures the core value: instantly knowing where your favorite local retailer is, in real time.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Secure user registration, login, logout with JWT-based sessions |
| 📍 **Live Location Tracking** | Real-time retailer location broadcast visible to followers |
| 👥 **Follow System** | Customers can follow/unfollow retailers and receive updates |
| 🧾 **Profile Management** | Full profile editing for both customers and retailers |
| 📊 **Analytics Dashboard** | Engagement metrics, follower counts, and activity insights |
| 🔔 **Real-Time Notifications** | Instant toast notifications powered by `react-hot-toast` & `react-toastify` |
| 📁 **File Uploads** | Profile image and media upload support (stored in `backend/uploads/`) |
| 📱 **Responsive Design** | Mobile-first, fully responsive UI |

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React** | Component-based UI framework |
| **Vite** | Lightning-fast build tool & dev server |
| **React Router DOM** | Client-side routing & navigation |
| **react-hot-toast** | Elegant toast notification popups |
| **react-toastify** | Advanced notification system |
| **CSS3** | Custom styling & responsive layouts |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | RESTful API framework |
| **MongoDB** | NoSQL document database |
| **Mongoose** | MongoDB ODM (Object Data Modeling) |
| **JWT (JSON Web Token)** | Stateless authentication |
| **Multer** | Multipart file upload handling |
| **bcrypt** | Password hashing & security |

### Dev & Tooling

| Tool | Purpose |
|---|---|
| **Git / GitHub** | Version control & collaboration |
| **.env** | Environment variable management |
| **npm** | Package management |

---

## 🏗 System Architecture

The application follows a classic **Client–Server–Database** architecture. The React frontend communicates with the Express backend via RESTful HTTP APIs. The backend persists data in MongoDB and handles all business logic, authentication, and file operations.

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                  │
│   ┌────────────────────────────────────────────────────────┐    │
│   │             React + Vite (Frontend)                    │    │
│   │                                                        │    │
│   │  ┌────────────┐  ┌──────────────┐  ┌───────────────┐  │    │
│   │  │  Auth Pages│  │  Dashboard   │  │ Retailer Pages│  │    │
│   │  │ (Login /   │  │  (Map, Feed, │  │ (Profile,     │  │    │
│   │  │  Register) │  │   Analytics) │  │  Follow, etc) │  │    │
│   │  └────────────┘  └──────────────┘  └───────────────┘  │    │
│   │                                                        │    │
│   │      HTTP Requests (Fetch / Axios)   Notifications     │    │
│   └───────────────────────┬────────────────────────────────┘    │
└───────────────────────────│──────────────────────────────────────┘
                            │  REST API  (JSON)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                   SERVER (Node.js + Express)                     │
│                                                                  │
│   ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐   │
│   │  Auth    │  │ Location  │  │ Profile  │  │  Analytics  │   │
│   │  Routes  │  │  Routes   │  │  Routes  │  │   Routes    │   │
│   └──────────┘  └───────────┘  └──────────┘  └─────────────┘   │
│                                                                  │
│   ┌──────────┐  ┌───────────┐  ┌──────────┐                     │
│   │  JWT     │  │  Multer   │  │  CORS    │                     │
│   │ Middleware│  │ (Uploads) │  │Middleware│                     │
│   └──────────┘  └───────────┘  └──────────┘                     │
└───────────────────────────┬──────────────────────────────────────┘
                            │  Mongoose ODM
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     DATABASE (MongoDB)                           │
│                                                                  │
│   ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌─────────────┐   │
│   │  Users   │  │ Retailers │  │ Follows  │  │  Analytics  │   │
│   │Collection│  │Collection │  │Collection│  │  Collection │   │
│   └──────────┘  └───────────┘  └──────────┘  └─────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
YahanHai-/
│
├── backend/                    # Node.js + Express server
│   ├── controllers/            # Route handler logic
│   │   ├── authController.js   # Login, register, token refresh
│   │   ├── locationController.js # Live location broadcast & retrieval
│   │   ├── profileController.js  # Profile CRUD operations
│   │   ├── followController.js   # Follow / unfollow retailers
│   │   └── analyticsController.js # Engagement metrics
│   ├── models/                 # Mongoose data models
│   │   ├── User.js             # Customer & retailer schema
│   │   ├── Location.js         # Live location document schema
│   │   ├── Follow.js           # Follow relationship schema
│   │   └── Analytics.js        # Analytics event schema
│   ├── routes/                 # Express route definitions
│   │   ├── auth.js
│   │   ├── location.js
│   │   ├── profile.js
│   │   ├── follow.js
│   │   └── analytics.js
│   ├── middleware/             # Custom middleware
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── uploadMiddleware.js # Multer file upload config
│   ├── uploads/                # Uploaded files (gitignored)
│   ├── .env                    # Backend environment variables (gitignored)
│   ├── package.json
│   └── server.js               # Express app entry point
│
├── frontend/                   # React + Vite application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar/
│   │   │   ├── Map/
│   │   │   ├── RetailerCard/
│   │   │   ├── FollowButton/
│   │   │   └── NotificationToast/
│   │   ├── pages/              # Page-level components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── RetailerProfile.jsx
│   │   │   ├── CustomerProfile.jsx
│   │   │   └── Analytics.jsx
│   │   ├── context/            # React Context (global state)
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Helper functions & API calls
│   │   ├── App.jsx             # Root component & router
│   │   └── main.jsx            # React DOM entry point
│   ├── .env                    # Frontend environment variables
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── package.json                # Root-level dependencies
└── README.md
```

> **Note:** Some folder names above are inferred from the project description and common MERN conventions. Actual sub-file names may vary slightly.

---

## 🔄 Data Flow Diagram

### Authentication Flow

```
User (Browser)                  Express Server              MongoDB
     │                               │                         │
     │── POST /api/auth/register ──▶ │                         │
     │                               │── Save hashed user ──▶  │
     │                               │◀── User document ──────  │
     │◀── 201 + JWT token ─────────  │                         │
     │                               │                         │
     │── POST /api/auth/login ──────▶│                         │
     │                               │── Find user by email ▶  │
     │                               │◀── User document ──────  │
     │                               │  (verify bcrypt hash)   │
     │◀── 200 + JWT token ─────────  │                         │
```

### Live Location Flow

```
Retailer App                    Express Server              MongoDB
     │                               │                         │
     │── PUT /api/location/update ──▶│  (JWT protected)        │
     │   { lat, lng, timestamp }     │                         │
     │                               │── Upsert Location doc ▶ │
     │◀── 200 OK ──────────────────  │                         │
                                     │
Customer App                         │
     │                               │                         │
     │── GET /api/location/:id ─────▶│                         │
     │                               │── Find latest Location ▶│
     │                               │◀── { lat, lng, time } ─  │
     │◀── Location data ───────────  │                         │
```

---

## 📡 API Reference

All API routes are prefixed with `/api`. Protected routes require a valid JWT in the `Authorization: Bearer <token>` header.

### Auth Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register a new user (customer or retailer) |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT token |
| `POST` | `/api/auth/logout` | ✅ | Invalidate session |
| `GET`  | `/api/auth/me` | ✅ | Get currently authenticated user |

### Location Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT`  | `/api/location/update` | ✅ | Retailer broadcasts their current location |
| `GET`  | `/api/location/:retailerId` | ✅ | Get latest location of a specific retailer |
| `GET`  | `/api/location/nearby` | ✅ | Get all nearby retailers within a radius |

### Profile Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/api/profile/:id` | ✅ | Get a user's public profile |
| `PUT`  | `/api/profile/update` | ✅ | Update authenticated user's profile |
| `POST` | `/api/profile/upload-avatar` | ✅ | Upload profile picture (multipart) |

### Follow Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/follow/:retailerId` | ✅ | Follow a retailer |
| `DELETE`| `/api/follow/:retailerId` | ✅ | Unfollow a retailer |
| `GET`  | `/api/follow/my-retailers` | ✅ | Get list of retailers the user follows |
| `GET`  | `/api/follow/followers/:id` | ✅ | Get follower count for a retailer |

### Analytics Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/api/analytics/overview` | ✅ | Dashboard overview metrics |
| `GET`  | `/api/analytics/retailer/:id` | ✅ | Analytics for a specific retailer |
| `GET`  | `/api/analytics/engagement` | ✅ | Follower/interaction trends |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v16 or higher
- [npm](https://www.npmjs.com/) v7 or higher
- [MongoDB](https://www.mongodb.com/) (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud URI)
- [Git](https://git-scm.com/)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/my-codespace/YahanHai-.git
cd YahanHai-
```

**2. Install root-level dependencies**

```bash
npm install
```

**3. Install backend dependencies**

```bash
cd backend
npm install
```

**4. Install frontend dependencies**

```bash
cd ../frontend
npm install
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

Create a `.env` file inside the `backend/` directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/yahanhai
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/yahanhai

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# File Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880    # 5MB in bytes
```

### Frontend (`frontend/.env`)

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=YahanHai
```

> ⚠️ **Security Note:** Never commit `.env` files to version control. They are already listed in `.gitignore`.

---

## ▶️ Running the Application

### Development Mode

Open **two terminal windows**:

**Terminal 1 — Start the Backend**

```bash
cd backend
npm run dev
# Server runs at http://localhost:5000
```

**Terminal 2 — Start the Frontend**

```bash
cd frontend
npm run dev
# App runs at http://localhost:5173
```

### Production Build

```bash
# Build the frontend
cd frontend
npm run build

# Serve from backend (if configured for static serving)
cd ../backend
npm start
```

---

## 🗄 Database Schema

### User Schema

```javascript
{
  _id: ObjectId,
  name: String,           // Full display name
  email: String,          // Unique, indexed
  password: String,       // bcrypt hashed
  role: String,           // "customer" | "retailer"
  avatar: String,         // Path to uploaded profile image
  phone: String,
  address: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Location Schema

```javascript
{
  _id: ObjectId,
  retailerId: ObjectId,   // Ref: User
  latitude: Number,
  longitude: Number,
  address: String,        // Reverse-geocoded address (optional)
  isLive: Boolean,        // Whether retailer is currently broadcasting
  updatedAt: Date
}
```

### Follow Schema

```javascript
{
  _id: ObjectId,
  followerId: ObjectId,   // Ref: User (customer)
  retailerId: ObjectId,   // Ref: User (retailer)
  createdAt: Date
}
```

### Analytics Schema

```javascript
{
  _id: ObjectId,
  retailerId: ObjectId,   // Ref: User
  event: String,          // "profile_view" | "follow" | "location_check"
  metadata: Object,       // Additional event data
  timestamp: Date
}
```

---

## 🖥 Screenshots & UI Overview

### Customer Dashboard

The main dashboard shows a live map of nearby retailers that the customer follows, along with a feed of recent activity.

```
┌─────────────────────────────────────────────────────┐
│  🔍 Search retailers...              [Profile] [🔔]  │
├────────────────────────┬────────────────────────────┤
│                        │  📌 Retailers Near You      │
│    🗺  Live Map         │  ┌──────────────────────┐  │
│                        │  │ 🛒 Ram's Vegetables   │  │
│    📍 [Retailer A]     │  │ 📍 0.3 km away • LIVE │  │
│    📍 [Retailer B]     │  │ ⭐ 4.8  👥 234 follows │  │
│         📍 You          │  └──────────────────────┘  │
│                        │  ┌──────────────────────┐  │
│                        │  │ 🍰 Sharma Sweets      │  │
│                        │  │ 📍 0.7 km away        │  │
│                        │  │ ⭐ 4.6  👥 189 follows │  │
│                        │  └──────────────────────┘  │
└────────────────────────┴────────────────────────────┘
```

### Retailer Profile Page

```
┌─────────────────────────────────────────────────────┐
│  ← Back                                             │
│  ┌────────┐                                         │
│  │  [IMG] │  Ram's Vegetables  ✅ Verified          │
│  └────────┘  📍 Lajpat Nagar, New Delhi             │
│              📞 +91 98765 43210                     │
│              👥 234 Followers   [  Follow  ]        │
├─────────────────────────────────────────────────────┤
│  📍 Live Location    🕐 Updated 2 mins ago          │
│  ┌─────────────────────────────────────────────┐   │
│  │              🗺 Mini Map                     │   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  📝 About: Fresh vegetables & fruits, sourced       │
│            directly from local farms every day.    │
└─────────────────────────────────────────────────────┘
```

### Analytics Dashboard (Retailer View)

```
┌─────────────────────────────────────────────────────┐
│  📊 My Analytics                   Last 30 days ▾   │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  👥 234  │  │  📍 87   │  │  👁 1,204        │  │
│  │ Followers│  │ Loc Views│  │  Profile Views   │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                                                     │
│  Follower Growth ──────────────────────────────     │
│  250 │                                    ●──●     │
│  200 │                          ●────●───          │
│  150 │               ●────●────                   │
│  100 │   ●────●────                               │
│   50 │──                                          │
│      └─────────────────────────────────────────── │
│        Jan   Feb   Mar   Apr   May                 │
└─────────────────────────────────────────────────────┘
```

---

## 🔒 Security Considerations

- All passwords are hashed using **bcrypt** before storage — plaintext passwords are never stored.
- API endpoints are protected by **JWT middleware**; unauthenticated requests receive a `401 Unauthorized` response.
- Environment variables (secrets, DB URIs) are stored in `.env` files that are **gitignored**.
- File uploads are validated for type and size limits using **Multer** middleware.
- CORS is configured on the Express server to allow only trusted origins.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/YahanHai-.git
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit:
   ```bash
   git commit -m "feat: add your feature description"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a **Pull Request** on the original repository.

### Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructuring |
| `chore:` | Maintenance / tooling |

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [React](https://react.dev/) — UI library
- [Express.js](https://expressjs.com/) — Backend framework
- [MongoDB](https://www.mongodb.com/) — Database
- [react-hot-toast](https://react-hot-toast.com/) — Beautiful notifications
- [react-toastify](https://fkhadra.github.io/react-toastify/) — Advanced toast notifications

---

<div align="center">

Made with ❤️ in India &nbsp; | &nbsp; **YahanHai** — *यहाँ है*

[⬆ Back to Top](#-yahanhai-)

</div>
