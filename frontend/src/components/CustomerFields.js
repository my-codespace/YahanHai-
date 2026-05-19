import React from "react";

export default function CustomerFields({ form, handleChange, handleFileChange }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="interest" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Interests
        </label>
        <input
          id="interest"
          name="interest"
          type="text"
          value={form.interest}
          onChange={handleChange}
          placeholder="E.g. Food, Fashion, Electronics"
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
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="profilePic" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Profile Picture (optional)
        </label>
        <input
          id="profilePic"
          name="profilePic"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ width: "100%" }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="dob" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Date of Birth (optional)
        </label>
        <input
          id="dob"
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="city" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          City
        </label>
        <input
          id="city"
          name="city"
          type="text"
          value={form.city}
          onChange={handleChange}
          placeholder="Your city"
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
    </>
  );
}
