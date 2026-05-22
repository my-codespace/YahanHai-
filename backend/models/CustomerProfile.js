const mongoose = require("mongoose");

const CustomerProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  
  profilePic: { type: String }, // File path
  
  // Highly practical for local apps
  savedAddresses: [{
    label: { type: String }, // e.g., "Home", "Office"
    coordinates: { type: [Number] } // [longitude, latitude]
  }],

  // Restricted to just proximity alerts as requested
  notificationPreferences: {
    proximityAlerts: { type: Boolean, default: true }
  }

}, { timestamps: true });

module.exports = mongoose.model("CustomerProfile", CustomerProfileSchema);
