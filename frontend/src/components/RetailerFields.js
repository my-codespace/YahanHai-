import React from "react";

export default function RetailerFields({ form, handleChange, handleFileChange }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="shopName" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Shop/Business Name
        </label>
        <input
          id="shopName"
          name="shopName"
          type="text"
          value={form.shopName}
          onChange={handleChange}
          placeholder="Your business name"
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
        <label htmlFor="businessCategory" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Business Category
        </label>
        <select
          id="businessCategory"
          name="businessCategory"
          value={form.businessCategory}
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
          <option value="">Select category</option>
          <option value="Food Truck">Food Truck</option>
          <option value="Pop-up Shop">Pop-up Shop</option>
          <option value="Mobile Boutique">Mobile Boutique</option>
          <option value="Event Stall">Event Stall</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="businessLogo" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Business Logo (suggested by category, or upload your own)
        </label>
        <input
          id="businessLogo"
          name="businessLogo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ width: "100%" }}
          required
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="businessDescription" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Business Description (optional)
        </label>
        <textarea
          id="businessDescription"
          name="businessDescription"
          value={form.businessDescription}
          onChange={handleChange}
          placeholder="Describe your business"
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
            boxSizing: "border-box",
            minHeight: 60,
          }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="gstin" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          GSTIN (optional, for verified badge)
        </label>
        <input
          id="gstin"
          name="gstin"
          type="text"
          value={form.gstin}
          onChange={handleChange}
          placeholder="Your GSTIN"
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
        <label htmlFor="operatingHours" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Operating Hours (optional)
        </label>
        <input
          id="operatingHours"
          name="operatingHours"
          type="text"
          value={form.operatingHours}
          onChange={handleChange}
          placeholder="e.g. 10am - 8pm or Always open"
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
        <label htmlFor="deliveryAvailable" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Delivery Available?
        </label>
        <input
          id="deliveryAvailable"
          name="deliveryAvailable"
          type="checkbox"
          checked={form.deliveryAvailable}
          onChange={handleChange}
          style={{ marginRight: 8 }}
        />
        <span style={{ fontSize: 15 }}>Yes</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="retailerPhoto" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
          Upload a photo of you with your business
        </label>
        <input
          id="retailerPhoto"
          name="retailerPhoto"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ width: "100%" }}
          required
        />
      </div>
    </>
  );
}
