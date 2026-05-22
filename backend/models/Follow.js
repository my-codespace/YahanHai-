const mongoose = require("mongoose");

const FollowSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  retailerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Ensure a customer can only follow a specific retailer once
FollowSchema.index({ customerId: 1, retailerId: 1 }, { unique: true });
FollowSchema.index({ retailerId: 1 }); // Quick lookup for "Interested Customers"

module.exports = mongoose.model("Follow", FollowSchema);
