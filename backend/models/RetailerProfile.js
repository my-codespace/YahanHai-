const mongoose = require("mongoose");

const RetailerProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  
  // Basic Info
  shopName: { type: String, required: true },
  businessCategory: { type: String, required: true },
  businessDescription: { type: String, maxLength: 500 },
  
  // Visuals
  businessLogo: { type: String },     // Standard logo
  storefrontPhoto: { type: String },  // Picture from the street
  ownerPhoto: { type: String },       // Picture of the retailer
  gallery: [{ type: String }],        // Array of URLs for inside the shop/products
  
  // Operations
  operatingHours: { 
    open: { type: String },    // e.g., "09:00 AM"
    close: { type: String },   // e.g., "09:00 PM"
    closedOn: { type: String } // e.g., "Tuesday"
  },
  deliveryAvailable: { type: Boolean, default: false },
  acceptedPayments: [{ type: String, enum: ['UPI', 'Cash', 'Cards'] }],
  
  // Legal/Tax
  gstin: { type: String }

}, { timestamps: true });

module.exports = mongoose.model("RetailerProfile", RetailerProfileSchema);
