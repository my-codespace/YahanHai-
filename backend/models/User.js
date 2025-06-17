  const mongoose = require("mongoose");

  const UserSchema = new mongoose.Schema({
    // Common fields
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["customer", "retailer"], required: true },
    lastSeen: { type: Date },
    isOnline: { type: Boolean, default: false },
    
    // Customer-specific fields
    interest: { type: String }, // For customers
    profilePic: { type: String }, // File path
    dob: { type: Date }, // Date of birth
    city: { type: String }, // For customers
    
    // Retailer-specific fields
    shopName: { type: String }, // For retailers
    businessCategory: { type: String }, // For retailers
    businessLogo: { type: String }, // File path
    businessDescription: { type: String }, // For retailers
    gstin: { type: String }, // For retailers
    operatingHours: { type: String }, // For retailers
    deliveryAvailable: { type: Boolean, default: false }, // For retailers
    retailerPhoto: { type: String }, // File path - photo with business
    
    // Existing fields
    avatarUrl: { type: String, default: "" },
    followedRetailers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    location: {
      lat: Number,
      lng: Number,
    },
  }, { timestamps: true });

  module.exports = mongoose.model("User", UserSchema);
