import React from "react";

export default function CustomerFields({ form, handleChange, handleFileChange }) {
  return (
    <>
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
    </>
  );
}
