const axios = require('axios');
const io = require('socket.io-client');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function runTests() {
  console.log("Starting Socket & Scoping Test...\n");

  try {
    // 1. Register Customer
    const custForm = new FormData();
    custForm.append('name', 'Socket Customer');
    custForm.append('email', 'cust_sock_' + Date.now() + '@example.com');
    custForm.append('password', 'password123');
    custForm.append('phone', '1234567890');
    custForm.append('role', 'customer');
    custForm.append('interest', 'Food');
    custForm.append('city', 'Delhi');
    
    const custRes = await axios.post(`${API_URL}/auth/register`, custForm, { headers: custForm.getHeaders() });
    const customerId = custRes.data.user._id;

    // 2. Register Retailer
    const retForm = new FormData();
    retForm.append('name', 'Socket Retailer');
    retForm.append('email', 'ret_sock_' + Date.now() + '@example.com');
    retForm.append('password', 'password123');
    retForm.append('phone', '0987654321');
    retForm.append('role', 'retailer');
    retForm.append('shopName', 'Socket Shop');
    retForm.append('businessCategory', 'Other');
    
    const retRes = await axios.post(`${API_URL}/auth/register`, retForm, { headers: retForm.getHeaders() });
    const retailerId = retRes.data.user._id;

    console.log(`✅ Registered Customer (${customerId}) & Retailer (${retailerId})`);

    // 3. Connect Sockets
    const custSocket = io(SOCKET_URL, { query: { userId: customerId } });
    const retSocket = io(SOCKET_URL, { query: { userId: retailerId } });

    await new Promise(res => custSocket.on('connect', res));
    await new Promise(res => retSocket.on('connect', res));
    console.log("✅ Sockets connected");

    custSocket.emit('join-room', 'customer');
    retSocket.emit('join-room', 'retailer');

    // Wait a bit for room joining to process on the server
    await delay(1000);

    let custReceivedRetailerUpdate = false;
    let retReceivedCustomerUpdate = false;

    custSocket.on('location-update', (data) => {
      if (data._id === retailerId) custReceivedRetailerUpdate = true;
      if (data._id === customerId) {
        console.error("❌ ERROR: Customer received their own update via socket! Scoping failed.");
      }
    });

    retSocket.on('location-update', (data) => {
      if (data._id === customerId) retReceivedCustomerUpdate = true;
      if (data._id === retailerId) {
        console.error("❌ ERROR: Retailer received their own update via socket! Scoping failed.");
      }
    });

    console.log("4. Updating Customer Location...");
    await axios.post(`${API_URL}/users/update-location`, { userId: customerId, lat: 28.6, lng: 77.2 }, { headers: { Authorization: `Bearer ${custRes.data.token}` } });

    console.log("5. Updating Retailer Location...");
    await axios.post(`${API_URL}/users/update-location`, { userId: retailerId, lat: 28.7, lng: 77.3 }, { headers: { Authorization: `Bearer ${retRes.data.token}` } });

    // Wait for sockets to receive events
    await delay(2000);

    if (retReceivedCustomerUpdate) {
      console.log("✅ SUCCESS: Retailer received Customer's location update");
    } else {
      console.error("❌ FAILED: Retailer did not receive Customer's location update");
    }

    if (custReceivedRetailerUpdate) {
      console.log("✅ SUCCESS: Customer received Retailer's location update");
    } else {
      console.error("❌ FAILED: Customer did not receive Retailer's location update");
    }

    // Disconnect
    custSocket.disconnect();
    retSocket.disconnect();
    
    // Also re-run test_flow to make sure nothing else broke
    console.log("\nRunning original test_flow.js to ensure no regressions...");
    const { execSync } = require('child_process');
    execSync('node test_flow.js', { stdio: 'inherit' });

    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runTests();
