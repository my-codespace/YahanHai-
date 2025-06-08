import React, { useState } from "react";
import { loginUser } from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

// Eye icon (show password)
const EyeIcon = ({ color = "#1976d2" }) => (
  <svg width="24" height="24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <ellipse cx="12" cy="12" rx="9" ry="5" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// Eye-off icon (hide password)
const EyeOffIcon = ({ color = "#1976d2" }) => (
  <svg width="24" height="24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <ellipse cx="12" cy="12" rx="9" ry="5" />
    <circle cx="12" cy="12" r="2" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);

// Google icon
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 48 48">
    <g>
      <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.6 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.3 4.5 29.4 2.5 24 2.5 12.4 2.5 3 11.9 3 23.5S12.4 44.5 24 44.5c11.1 0 20.5-8.5 20.5-21.5 0-1.4-.2-2.8-.5-4z"/>
      <path fill="#34A853" d="M6.3 14.7l7 5.1C15.7 16.2 19.6 13 24 13c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.3 4.5 29.4 2.5 24 2.5c-6.5 0-12.2 2.6-16.3 6.7z"/>
      <path fill="#FBBC05" d="M24 44.5c5.8 0 10.7-1.9 14.3-5.1l-6.6-5.4C29.7 35.1 27 36 24 36c-5.8 0-10.7-3.9-12.5-9.3l-7 5.4C7.8 41.1 15.5 44.5 24 44.5z"/>
      <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.4 4.2-5.5 7.5-11.7 7.5-6.5 0-12.2-5.3-12.2-12s5.7-12 12.2-12c3.1 0 6 .9 8.3 2.7l6.2-6.2C34.3 4.5 29.4 2.5 24 2.5c-11.6 0-21 9.4-21 21s9.4 21 21 21c11.1 0 20.5-8.5 20.5-21.5 0-1.4-.2-2.8-.5-4z"/>
    </g>
  </svg>
);

// Apple icon
const AppleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#111">
    <path d="M16.365 1.43c0 1.14-.93 2.07-2.07 2.07-1.14 0-2.07-.93-2.07-2.07 0-1.14.93-2.07 2.07-2.07 1.14 0 2.07.93 2.07 2.07zm4.77 7.57c-2.15-.02-3.99 1.23-5.03 1.23-1.05 0-2.67-1.2-4.41-1.16-2.26.03-4.35 1.31-5.51 3.33-2.36 4.09-.6 10.16 1.7 13.5 1.13 1.64 2.47 3.48 4.25 3.41 1.71-.07 2.36-1.12 4.43-1.12 2.07 0 2.65 1.12 4.43 1.09 1.82-.03 2.96-1.66 4.06-3.31 1.27-1.87 1.78-3.65 1.8-3.75-.04-.02-3.41-1.31-3.45-5.19-.03-3.25 2.65-4.77 2.77-4.85-1.52-2.24-3.89-2.49-4.72-2.52z"/>
  </svg>
);

export default function Login({ onAuth }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        onAuth(res.token, res.role);
      }, 1500);
    } else {
      setError(res.msg || "Login failed");
      toast.error(res.msg || "Login failed");
    }
  };

  // Simulate Google/Apple login
  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login coming soon!`);
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

        {/* Social login buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            margin: "18px 0 12px 0",
            justifyContent: "center",
          }}
        >
          <button
            type="button"
            onClick={() => handleSocialLogin("Google")}
            style={{
              flex: 1,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "8px 0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: "#444",
              fontSize: 15,
              transition: "box-shadow 0.2s",
              boxShadow: "0 2px 8px #1976d211",
            }}
          >
            <GoogleIcon style={{ marginRight: 6 }} />
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("Apple")}
            style={{
              flex: 1,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "8px 0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: "#444",
              fontSize: 15,
              transition: "box-shadow 0.2s",
              boxShadow: "0 2px 8px #1976d211",
            }}
          >
            <AppleIcon style={{ marginRight: 6 }} />
            Apple
          </button>
        </div>
        <div
          style={{
            textAlign: "center",
            color: "#aaa",
            fontSize: 13,
            margin: "4px 0 16px 0",
          }}
        >
          or sign in with email
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
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "12px 48px 12px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              boxSizing: "border-box",
            }}
            autoComplete="current-password"
            required
          />
          <div
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              userSelect: "none",
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === "Enter") setShowPassword((v) => !v);
            }}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </div>
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
