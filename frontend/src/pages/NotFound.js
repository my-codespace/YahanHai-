import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1976d2 0%, #63a4ff 100%)",
        padding: 24,
        fontFamily: "Inter, Arial, sans-serif",
        color: "#333",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          borderRadius: 24,
          padding: 40,
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>🧭</div>
        <h1
          style={{
            margin: "0 0 12px 0",
            fontSize: "4.5rem",
            fontWeight: 900,
            color: "#1976d2",
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <h2
          style={{
            margin: "0 0 12px 0",
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#444",
          }}
        >
          Lost in Space?
        </h2>
        <p
          style={{
            margin: "0 0 32px 0",
            fontSize: "1rem",
            lineHeight: "1.6",
            color: "#666",
          }}
        >
          The coordinates you entered don't map to any location. Let's redirect your compass back to the main dashboard maps.
        </p>
        <Link
          to="/dashboard/map"
          style={{
            display: "inline-block",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 32px",
            fontSize: "1.05rem",
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(25, 118, 210, 0.3)",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.03)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1.0)")}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
