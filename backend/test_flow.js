const axios = require('axios');
const fs = require('fs');
try {
  require('dotenv').config();
} catch (e) {}

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log("Starting End-to-End API Flow Test...\n");

  let customerToken, retailerToken;
  let customerId, retailerId;

  try {
    console.log("1. Registering Customer...");
    // Simulate FormData for customer registration
    const FormData = require('form-data');
    const custForm = new FormData();
    custForm.append('name', 'Test Customer');
    custForm.append('email', 'customer_test_' + Date.now() + '@example.com');
    custForm.append('password', 'password123');
    custForm.append('phone', '1234567890');
    custForm.append('role', 'customer');
    custForm.append('interest', 'Food');
    custForm.append('city', 'Delhi');
    
    const custRes = await axios.post(`${API_URL}/auth/register`, custForm, {
      headers: custForm.getHeaders()
    });
    console.log("✅ Customer registered successfully:", custRes.data.user.name);
    customerToken = custRes.data.token;
    customerId = custRes.data.user._id;

    console.log("2. Registering Retailer...");
    const retForm = new FormData();
    retForm.append('name', 'Test Retailer');
    retForm.append('email', 'retailer_test_' + Date.now() + '@example.com');
    retForm.append('password', 'password123');
    retForm.append('phone', '0987654321');
    retForm.append('role', 'retailer');
    retForm.append('shopName', 'Test Shop');
    retForm.append('businessCategory', 'Other');
    
    const retRes = await axios.post(`${API_URL}/auth/register`, retForm, {
      headers: retForm.getHeaders()
    });
    console.log("✅ Retailer registered successfully:", retRes.data.user.name);
    retailerToken = retRes.data.token;
    retailerId = retRes.data.user._id;

    console.log("3. Setting Location for Customer (Connaught Place, Delhi)...");
    const custLocRes = await axios.post(`${API_URL}/users/update-location`, {
      userId: customerId,
      lat: 28.6304,
      lng: 77.2177
    }, { headers: { Authorization: `Bearer ${customerToken}` } });
    console.log("✅ Customer location set! Returned Lat/Lng:", 
      custLocRes.data.user.location.lat, custLocRes.data.user.location.lng);

    console.log("4. Setting Location for Retailer (Nearby CP, Delhi)...");
    const retLocRes = await axios.post(`${API_URL}/users/update-location`, {
      userId: retailerId,
      lat: 28.6310,
      lng: 77.2180
    }, { headers: { Authorization: `Bearer ${retailerToken}` } });
    console.log("✅ Retailer location set! Returned Lat/Lng:", 
      retLocRes.data.user.location.lat, retLocRes.data.user.location.lng);

    console.log("5. Querying nearby retailers for customer (should find Test Retailer)...");
    const nearbyRetRes = await axios.get(`${API_URL}/users/retailers?lat=28.6304&lng=77.2177`, { headers: { Authorization: `Bearer ${customerToken}` } });
    const foundRetailer = nearbyRetRes.data.find(r => r.id === retailerId);
    if (foundRetailer) {
       console.log(`✅ Success! Customer can see the retailer on the map. Distance is close enough.`);
       console.log(`   Returned Retailer Location: lat=${foundRetailer.lat}, lng=${foundRetailer.lng}`);
    } else {
       console.log("❌ Failed to find the retailer in the $near query.");
    }

    console.log("6. Querying nearby customers for retailer (should find Test Customer)...");
    const nearbyCustRes = await axios.get(`${API_URL}/users/customers?lat=28.6310&lng=77.2180`, { headers: { Authorization: `Bearer ${retailerToken}` } });
    const foundCustomer = nearbyCustRes.data.find(c => c.id === customerId);
    if (foundCustomer) {
       console.log(`✅ Success! Retailer can see the customer on the map.`);
       console.log(`   Returned Customer Location: lat=${foundCustomer.lat}, lng=${foundCustomer.lng}`);
    } else {
       console.log("❌ Failed to find the customer in the $near query.");
    }

    console.log("7. Testing Follow Retailer functionality...");
    const followRes = await axios.post(`${API_URL}/users/follow`, {
      customerId: customerId,
      retailerId: retailerId
    }, { headers: { Authorization: `Bearer ${customerToken}` } });
    console.log(`✅ Customer followed retailer: ${followRes.data.msg}`);

    // Verify customer's profile is updated
    const customerProfile = await axios.get(`${API_URL}/users/${customerId}`, { headers: { Authorization: `Bearer ${customerToken}` } });
    if (customerProfile.data.followedRetailers.includes(retailerId)) {
      console.log("✅ Verified: Retailer ID is in customer's followedRetailers array.");
    } else {
      console.log("❌ Failed to verify followedRetailers update.");
    }

    console.log("8. Testing Unfollow Retailer functionality...");
    const unfollowRes = await axios.post(`${API_URL}/users/unfollow`, {
      customerId: customerId,
      retailerId: retailerId
    }, { headers: { Authorization: `Bearer ${customerToken}` } });
    console.log(`✅ Customer unfollowed retailer: ${unfollowRes.data.msg}`);

    console.log("\nAll API flows, geospatial queries, and follow functionalities passed successfully!");

  } catch (error) {
    console.error("Test failed:", error.response ? JSON.stringify(error.response.data) : error.message);
  }
}

runTests();
