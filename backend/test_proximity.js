const axios = require('axios');
const io = require('socket.io-client');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

async function runTests() {
  console.log("Starting Proximity Alert Test...\n");

  try {
    // 1. Register Retailer
    const retForm = new FormData();
    retForm.append('name', 'Prox Retailer');
    retForm.append('email', 'ret_prox_' + Date.now() + '@example.com');
    retForm.append('password', 'password123');
    retForm.append('phone', '0987654321');
    retForm.append('role', 'retailer');
    const retRes = await axios.post(`${API_URL}/auth/register`, retForm, { headers: retForm.getHeaders() });
    const retailerId = retRes.data.user._id;
    const retailerToken = retRes.data.token;

    // 2. Register Customer (Follower)
    const custForm = new FormData();
    custForm.append('name', 'Prox Follower');
    custForm.append('email', 'cust_prox_' + Date.now() + '@example.com');
    custForm.append('password', 'password123');
    custForm.append('role', 'customer');
    custForm.append('phone', '1111111111');
    const custRes = await axios.post(`${API_URL}/auth/register`, custForm, { headers: custForm.getHeaders() });
    const followerId = custRes.data.user._id;
    const followerToken = custRes.data.token;

    // Follow retailer
    await axios.post(`${API_URL}/users/follow`, { customerId: followerId, retailerId }, { headers: { Authorization: `Bearer ${followerToken}` } });

    // Initial Locations (Far apart)
    // Delhi coordinates
    await axios.post(`${API_URL}/users/update-location`, { userId: retailerId, lat: 28.6300, lng: 77.2100 }, { headers: { Authorization: `Bearer ${retailerToken}` } });
    await axios.post(`${API_URL}/users/update-location`, { userId: followerId, lat: 28.7000, lng: 77.3000 }, { headers: { Authorization: `Bearer ${followerToken}` } });

    // Connect Customer Socket
    const custSocket = io(SOCKET_URL, { query: { userId: followerId } });
    await new Promise(res => custSocket.on('connect', res));
    console.log("Customer Socket Connected");

    let proximityAlertReceived = 0;
    custSocket.on('proximity_alert', (notif) => {
      console.log(`\n🔔 PROXIMITY ALERT RECEIVED via SOCKET: ${notif.message}\n`);
      proximityAlertReceived++;
    });

    await delay(1000);

    console.log("Moving Retailer closer (but still far > 200m)...");
    await axios.post(`${API_URL}/users/update-location`, { userId: retailerId, lat: 28.6900, lng: 77.2900 }, { headers: { Authorization: `Bearer ${retailerToken}` } });
    await delay(2000);

    if (proximityAlertReceived > 0) {
      console.error("❌ ERROR: Received alert when retailer was still far away!");
    } else {
      console.log("✅ Correct: No alert fired.");
    }

    console.log("\nMoving Retailer inside 200m radius (Lat: 28.7001, Lng: 77.3001)...");
    await axios.post(`${API_URL}/users/update-location`, { userId: retailerId, lat: 28.7001, lng: 77.3001 }, { headers: { Authorization: `Bearer ${retailerToken}` } });
    await delay(2000);

    if (proximityAlertReceived === 1) {
      console.log("✅ SUCCESS: First Proximity Alert Fired!");
    } else {
      console.error(`❌ ERROR: Expected 1 alert, got ${proximityAlertReceived}`);
    }

    console.log("\nRetailer moves again within the radius (debounce test)...");
    await axios.post(`${API_URL}/users/update-location`, { userId: retailerId, lat: 28.7002, lng: 77.3002 }, { headers: { Authorization: `Bearer ${retailerToken}` } });
    await delay(2000);

    if (proximityAlertReceived === 1) {
      console.log("✅ SUCCESS: Debounce worked! No second alert fired.");
    } else {
      console.error(`❌ ERROR: Debounce failed. Alerts received: ${proximityAlertReceived}`);
    }

    // Check Notification API
    console.log("\nChecking Notifications via API...");
    const notifRes = await axios.get(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${followerToken}` } });
    const notifications = notifRes.data;
    
    if (notifications.length === 1 && notifications[0].type === 'proximity_alert') {
      console.log("✅ SUCCESS: Notification saved to DB correctly.");
      
      // Mark as read
      await axios.put(`${API_URL}/notifications/${notifications[0]._id}/read`, {}, { headers: { Authorization: `Bearer ${followerToken}` } });
      const verifyRes = await axios.get(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${followerToken}` } });
      if (verifyRes.data[0].isRead) {
        console.log("✅ SUCCESS: Notification marked as read correctly.");
      } else {
        console.error("❌ ERROR: Notification isRead was not updated.");
      }
    } else {
      console.error("❌ ERROR: Notification not found in DB.");
    }

    custSocket.disconnect();
    console.log("\nAll Proximity Tests Passed!");
    process.exit(0);
  } catch (err) {
    console.error(err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
