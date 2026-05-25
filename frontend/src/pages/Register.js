import React, { useState } from "react";
import { registerUser } from "../api/index";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import CustomerFields from "../components/CustomerFields";
import RetailerFields from "../components/RetailerFields";





const initialForm = {
  // Common fields
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "customer",
  // Customer
  profilePic: null,
  // Retailer
  shopName: "",
  businessCategory: "",
  businessLogo: null,
  businessDescription: "",
  gstin: "",
  operatingHours: "",
  deliveryAvailable: false,
  retailerPhoto: null,
};

export default function Register({ onAuth }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Handle text, select, and checkbox changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files && files[0] ? files[0] : null,
    }));
  };

  const handleKeyDown = (e) => {
    setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Prepare form data for file upload
    const formData = new FormData();

// Append all common fields
formData.append('name', form.name);
formData.append('email', form.email);
formData.append('password', form.password);
formData.append('phone', form.phone);
formData.append('role', form.role);

// Customer fields
if (form.role === 'customer') {
  if (form.profilePic) formData.append('profilePic', form.profilePic);
}

// Retailer fields
if (form.role === 'retailer') {
  formData.append('shopName', form.shopName);
  formData.append('businessCategory', form.businessCategory);
  formData.append('businessDescription', form.businessDescription);
  formData.append('gstin', form.gstin);
  formData.append('operatingHours', form.operatingHours);
  formData.append('deliveryAvailable', form.deliveryAvailable);
  if (form.businessLogo) formData.append('businessLogo', form.businessLogo);
  if (form.retailerPhoto) formData.append('retailerPhoto', form.retailerPhoto);
  if (form.storefrontPhoto) formData.append('storefrontPhoto', form.storefrontPhoto);
}

    const res = await registerUser(formData); // Your backend should handle multipart/form-data
    if (res.token) {
      toast.success("Registration successful! Redirecting...");
      setTimeout(() => {
        onAuth(res.token, res.role, res.user); // Pass user object from backend response
      }, 1500);
    } else {
      setError(res.msg || "Registration failed");
      toast.error(res.msg || "Registration failed");
    }
  };



  const isRetailer = form.role === "retailer";
  const isCustomer = form.role === "customer";

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
          maxWidth: 450,
          width: "100%",
          boxSizing: "border-box",
        }}
        encType="multipart/form-data"
      >
        {/* Logo and welcoming headline */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <img
            src="/my-map-icon.png"
            alt="YahanHai! Logo"
            style={{ height: 48, marginBottom: 8, userSelect: "none" }}
            draggable={false}
          />
          <div style={{ fontSize: 24, fontWeight: 700, color: "#1976d2", marginBottom: 2 }}>
            Namaste! 👋
          </div>
          <div style={{ fontSize: 18, color: "#1976d2", fontWeight: 600 }}>
            Create your YahanHai! account
          </div>
          <div style={{ fontSize: 14, color: "#444", marginBottom: 8 }}>
            Join the local world today
          </div>
        </div>



        {/* Name field */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="name" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              boxSizing: "border-box",
            }}
            autoFocus
            required
          />
        </div>
        {/* Email field */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
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
            autoComplete="username"
            required
          />
        </div>
        {/* Password field */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Create a password"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              boxSizing: "border-box",
            }}
            autoComplete="new-password"
            required
          />
          {capsLockOn && (
            <div style={{ color: "#d32f2f", marginTop: 6, fontWeight: 600 }}>
              Caps Lock is ON
            </div>
          )}
        </div>
        {/* Phone field */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="phone" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="Your phone number"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              boxSizing: "border-box",
            }}
            required
          />
        </div>
        {/* Role selection */}
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="role" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Register as
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              boxSizing: "border-box",
              background: "#f9f9f9",
              color: "#1976d2",
              fontWeight: 600,
            }}
            required
          >
            <option value="customer">Customer</option>
            <option value="retailer">Retailer</option>
          </select>
        </div>

        {/* Dynamic fields */}
        {isCustomer && (
          <CustomerFields form={form} handleChange={handleChange} handleFileChange={handleFileChange} />
        )}

        {isRetailer && (
          <RetailerFields form={form} handleChange={handleChange} handleFileChange={handleFileChange} />
        )}

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
          Register
        </button>
        {/* Login link */}
        <div
          style={{
            marginTop: 10,
            textAlign: "center",
            fontSize: 15,
          }}
        >
          <a
            href="/login"
            className="link-hover"
            style={{ color: "#1976d2", textDecoration: "underline" }}
          >
            Already have an account? Login here
          </a>
        </div>
      </motion.form>
    </div>
  );
}
