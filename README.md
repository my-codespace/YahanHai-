# YahanHai! 📍

A production-grade, real-time local shop discovery platform that bridges the gap between customers and nearby retailers. Built with the MERN stack, YahanHai utilizes real-time geolocation mapping to enable customers to seamlessly discover, follow, and interact with local businesses.

---

## 🌟 Key Features

### For Customers
* **Proximity-Based Discovery:** Instantly view nearby active retailers on an interactive map using geographic radius calculations (Haversine formula).
* **Real-Time Status Updates:** See exactly which retailers are currently online and active via WebSocket integration.
* **Follow System:** Subscribe to favorite local shops and receive instant notifications when they come online.
* **Dynamic Profiles:** Set up personalized profiles with custom avatars, specific interests, and location data.

### For Retailers
* **Live Business Broadcasting:** Broadcast live business location and operating status to nearby customers.
* **Customer Analytics:** View and track local customers who have favorited or shown interest in the business.
* **Rich Business Profiles:** Showcase shop details, operating hours, business categories, and upload custom business logos and storefront photos.

### System-Wide
* **Secure Authentication:** JWT-based authentication combined with secure password hashing (Bcrypt).
* **Role-Based Access Control:** Distinct dashboard experiences and data access depending on user roles (`customer` vs `retailer`).
* **Real-time Synchronization:** Socket.IO handles live location updates, connection heartbeats, and instant event broadcasting.

---

## 🛠️ Technology Stack

**Frontend**
* **React.js** (Component-driven UI)
* **React Router v7** (Application routing and navigation)
* **React Leaflet** (Interactive map rendering and geographic visualization)
* **Material UI (@mui/material)** (Component styling and design system)
* **Socket.io-client** (Real-time bidirectional event handling)

**Backend**
* **Node.js & Express.js** (REST API framework)
* **Socket.IO** (Real-time WebSocket server)
* **Multer** (Multipart/form-data handling for image uploads)
* **JSON Web Tokens (JWT)** (Stateless secure authentication)

**Database**
* **MongoDB** (NoSQL document database)
* **Mongoose** (Object Data Modeling)

---

## 🏗️ System Architecture

```mermaid
graph TD
    UI[Frontend Client] -->|REST API Requests| API[Express API Gateway]
    UI <-->|WebSocket Events| WSS[Socket.IO Server]
    
    API --> Auth[Authentication Module]
    API --> User[User & Location Services]
    API --> File[Multer Upload Service]
    
    WSS --> Heartbeat[Presence & Heartbeat Engine]
    WSS --> Broadcast[Location Broadcast Engine]
    
    Auth --> DB[(MongoDB Database)]
    User --> DB
    Heartbeat --> DB
    
    File --> Storage[Local File System]
