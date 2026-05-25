import React, { useState } from "react";
import { loginUser } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";





export default function Login({ onAuth }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleKeyDown = (e) => {
    setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await loginUser(form);
    if (res.token) {
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        onAuth(res.token, res.role, res.user);
      }, 1500);
    } else {
      setError(res.msg || "Login failed");
      toast.error(res.msg || "Login failed");
    }
  };



  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1976d2 0%, #63a4ff 100%)",
        padding: 20,
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <ToastContainer position="top-center" autoClose={1500} />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(25, 118, 210, 0.18)",
          maxWidth: 400,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Logo and welcoming headline */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <img
            src="/my-map-icon.png"
            alt="YahanHai! Logo"
            style={{ height: 48, marginBottom: 8, userSelect: "none" }}
            draggable={false}
          />
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#1976d2",
              marginBottom: 2,
            }}
          >
            Namaste! 👋
          </div>
          <div style={{ fontSize: 18, color: "#1976d2", fontWeight: 600 }}>
            Welcome back to YahanHai!
          </div>
          <div style={{ fontSize: 14, color: "#444", marginBottom: 8 }}>
            Connecting you to your local world
          </div>
        </div>



        {/* Email field */}
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              boxSizing: "border-box",
            }}
            autoFocus
            autoComplete="username"
            required
          />
        </div>
        {/* Password field */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: 6, fontWeight: 600 }}
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              boxSizing: "border-box",
            }}
            autoComplete="current-password"
            required
          />
          {capsLockOn && (
            <div style={{ color: "#d32f2f", marginTop: 6, fontWeight: 600 }}>
              Caps Lock is ON
            </div>
          )}
        </div>
        {/* Error message */}
        {error && (
          <div style={{ color: "#d32f2f", marginBottom: 16 }}>{error}</div>
        )}
        {/* Submit button */}
        <button
          type="submit"
          className="button-hover"
          style={{
            width: "100%",
            padding: "14px 0",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 24,
            fontWeight: 700,
            fontSize: 18,
            cursor: "pointer",
            boxShadow: "0 4px 16px #1976d233",
            transition: "all 0.3s ease",
            marginBottom: 6,
          }}
        >
          Login
        </button>
        {/* Forgot password & Register links */}
        <div
          style={{
            marginTop: 10,
            textAlign: "center",
            fontSize: 15,
          }}
        >
          <a
            href="#"
            className="link-hover"
            style={{
              color: "#1976d2",
              marginRight: 16,
              textDecoration: "underline",
            }}
            onClick={e => {
              e.preventDefault();
              toast.info("Forgot password feature coming soon!");
            }}
          >
            Forgot password?
          </a>
          <a
            href="/register"
            className="link-hover"
            style={{ color: "#1976d2", textDecoration: "underline" }}
          >
            Not a member? Register here
          </a>
        </div>
      </motion.form>
    </div>
  );
}
