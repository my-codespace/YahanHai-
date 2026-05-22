const mongoose = require("mongoose");

const UserLocationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  role: { type: String, required: true },
  isOnline: { type: Boolean, default: false, index: true },
  lastSeen: { type: Date },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] } // [longitude, latitude]
  }
});

// Add 2dsphere index for geospatial queries
UserLocationSchema.index({ location: "2dsphere" });
UserLocationSchema.index({ role: 1, isOnline: 1 }); // Fast map queries

const locationTransform = (doc, ret) => {
  if (ret.location && ret.location.coordinates && ret.location.coordinates.length === 2) {
    ret.location = {
      lat: ret.location.coordinates[1],
      lng: ret.location.coordinates[0],
    };
  }
  return ret;
};

UserLocationSchema.set('toJSON', { transform: locationTransform });
UserLocationSchema.set('toObject', { transform: locationTransform });

module.exports = mongoose.model("UserLocation", UserLocationSchema);
