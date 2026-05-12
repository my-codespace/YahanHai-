<div align="center">

# 🏪 Yahan Hai!

[![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=28&pause=1000&color=4ADE80&center=true&vCenter=true&width=600&lines=Discover+Local+Shops+Instantly;Real-Time+Location+Sharing;Empowering+Local+Retailers;Built+with+MERN+%2B+Socket.io)](https://git.io/typing-svg)

*Bridge the gap between local businesses and nearby customers through real-time discovery and seamless location tracking.*

<br />

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](#)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](#)
[![Material UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)](#)

[Live Demo](#) • [Report Bug](https://github.com/my-codespace/YahanHai-/issues) • [Request Feature](https://github.com/my-codespace/YahanHai-/issues)

</div>

---

## 📖 Project Overview

**Yahan Hai!** is a comprehensive local shop discovery web application engineered to connect neighborhood retailers with nearby customers. By leveraging real-time geographic data, the platform solves the visibility problem for small-scale physical businesses while giving consumers instant access to available services in their immediate vicinity. 

Built with the modern web in mind, this project emphasizes **performance, bi-directional real-time communication, and an intuitive, animated user experience**.

---

## ✨ Project Highlights

<details open>
<summary><b>Click to Expand Features</b></summary>
<br>

| Feature | Description |
| :--- | :--- |
| 📍 **Real-Time Location Tracking** | Seamless WebSocket integration (`Socket.io`) allowing customers to see live vendor movements and availability. |
| 🗺️ **Interactive Mapping** | Immersive map views using `Leaflet` and `React Google Maps API` for localized searches and pin-point accuracy. |
| 📊 **Retailer Analytics** | Insightful data representation using `Chart.js` for retailers to track engagement and customer interest. |
| 🎨 **Animated & Responsive UI** | Fluid interface built with `Material UI` and `Framer Motion` for an engaging user journey. |
| 🔐 **Secure Authentication** | Robust JWT-based authentication with `bcryptjs` password hashing. |
| 🖼️ **Media Management** | Integrated local file system uploads via `Multer` for business logos and user avatars. |

</details>

---

## 🛠️ Tech Stack

### 💻 Frontend
| Technology | Description |
| :--- | :--- |
| **React 19** | Core UI library for building component-driven interfaces. |
| **Material UI** | Comprehensive suite of UI tools for a modern, accessible design. |
| **Framer Motion** | Production-ready animation library for React. |
| **Leaflet & React Leaflet** | Open-source interactive mapping capabilities. |
| **Chart.js & React Chartjs 2** | Dynamic, interactive data visualizations. |
| **Socket.io-client** | Client-side real-time event listeners and emitters. |

### ⚙️ Backend
| Technology | Description |
| :--- | :--- |
| **Node.js & Express 5** | High-performance server environment and API framework. |
| **MongoDB & Mongoose 8** | NoSQL database and elegant object data modeling. |
| **Socket.io** | Event-driven real-time bidirection communication engine. |
| **JWT & Bcryptjs** | Stateless authentication and cryptographic password hashing. |
| **Multer** | Middleware for handling `multipart/form-data` and media uploads. |

---

## 📸 Screenshots & Demo

<div align="center">

| Interactive Map Dashboard | Dark Mode Interface |
| :---: | :---: |
| <img src="https://via.placeholder.com/400x250.png?text=Map+Dashboard+Preview" alt="Map Dashboard" width="400"/> | <img src="https://via.placeholder.com/400x250.png?text=Dark+Mode+UI+Preview" alt="Dark Mode" width="400"/> |
| **Retailer Analytics** | **Real-time Activity Feed** |
| <img src="https://via.placeholder.com/400x250.png?text=Chart.js+Analytics+View" alt="Analytics" width="400"/> | <img src="https://via.placeholder.com/400x250.png?text=Live+Activity+Feed" alt="Feed" width="400"/> |

</div>

---

## 🏗️ Architecture

### System Flow
```mermaid
graph TD
    Client[React Frontend] <-->|Socket.io Real-Time Stream| Server[Node.js / Express Backend]
    Client <-->|REST API / HTTP| Server
    Server -->|Read/Write| DB[(MongoDB)]
    Server -->|File I/O| FS[Multer Uploads]
    
    subgraph Frontend Architecture
    UI[MUI Components] --> Pages[View Layer]
    Pages --> API[Axios/Fetch Layer]
    Pages --> Maps[Leaflet/Google Maps]
    Pages --> Charts[Chart.js]
    end
    
    subgraph Backend Architecture
    Routes[Express API Routes] --> Controllers[Business Logic]
    Controllers --> Models[Mongoose Models]
    Controllers --> Auth[JWT & Bcrypt]
    endYahanHai-/
├── backend/
│   ├── config/          # Database configuration (db.js)
│   ├── models/          # Mongoose schemas (User.js)
│   ├── routes/          # Express API routes (auth.js, users.js)
│   ├── uploads/         # Static media assets (profile/retailer images)
│   ├── server.js        # Entry point & Socket.io initialization
│   └── package.json     # Backend dependencies
└── frontend/
    ├── public/          # Static assets, icons, manifest
    ├── src/
    │   ├── api/         # API integration layer
    │   ├── components/  # Reusable UI (MapPanel, Dashboards, Cards)
    │   ├── hooks/       # Custom React hooks (useDarkMode)
    │   ├── pages/       # Route-level components (Login, Profile)
    │   ├── utils/       # Helper functions (createAvatarIcon)
    │   └── App.js       # Main React router/component tree
    └── package.json     # Frontend dependencies
