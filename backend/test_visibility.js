const axios = require('axios');
const io = require('socket.io-client');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

async function runTests() {
  console.log("Starting Visibility Rule Test...\n");

  try {
    // 1. Register Retailer
    const retForm = new FormData();
    retForm.append('name', 'Vis Retailer');
    retForm.append('email', 'ret_vis_' + Date.now() + '@example.com');
    retForm.append('password', 'password123');
    retForm.append('phone', '0987654321');
    retForm.append('role', 'retailer');
    const retRes = await axios.post(`${API_URL}/auth/register`, retForm, { headers: retForm.getHeaders() });
    const retailerId = retRes.data.user._id;

    // 2. Register Customer 1 (Follower)
    const cust1Form = new FormData();
    cust1Form.append('name', 'Vis Follower');
    cust1Form.append('email', 'cust1_vis_' + Date.now() + '@example.com');
    cust1Form.append('password', 'password123');
    cust1Form.append('role', 'customer');
    cust1Form.append('phone', '1111111111');
    cust1Form.append('interest', 'Food');
    cust1Form.append('city', 'Delhi');
    const cust1Res = await axios.post(`${API_URL}/auth/register`, cust1Form, { headers: cust1Form.getHeaders() });
    const followerId = cust1Res.data.user._id;

    // Follow retailer
    await axios.post(`${API_URL}/users/follow`, { customerId: followerId, retailerId }, { headers: { Authorization: `Bearer ${cust1Res.data.token}` } });

    // 3. Register Customer 2 (Non-Follower)
    const cust2Form = new FormData();
    cust2Form.append('name', 'Vis Non-Follower');
    cust2Form.append('email', 'cust2_vis_' + Date.now() + '@example.com');
    cust2Form.append('password', 'password123');
    cust2Form.append('role', 'customer');
    cust2Form.append('phone', '2222222222');
    cust2Form.append('interest', 'Clothes');
    cust2Form.append('city', 'Delhi');
    const cust2Res = await axios.post(`${API_URL}/auth/register`, cust2Form, { headers: cust2Form.getHeaders() });
    const nonFollowerId = cust2Res.data.user._id;

    // Set locations
    await axios.post(`${API_URL}/users/update-location`, { userId: retailerId, lat: 28.0000, lng: 77.0000 }, { headers: { Authorization: `Bearer ${retRes.data.token}` } });
    await axios.post(`${API_URL}/users/update-location`, { userId: followerId, lat: 28.0010, lng: 77.0010 }, { headers: { Authorization: `Bearer ${cust1Res.data.token}` } });
    await axios.post(`${API_URL}/users/update-location`, { userId: nonFollowerId, lat: 28.0020, lng: 77.0020 }, { headers: { Authorization: `Bearer ${cust2Res.data.token}` } });

    // Connect Retailer
    const retSocket = io(SOCKET_URL, { query: { userId: retailerId } });
    await new Promise(res => retSocket.on('connect', res));

    // Listen for active users
    let activeUsers = [];
    retSocket.on('active-users', users => {
      activeUsers = users;
    });

    retSocket.emit('join-room', 'retailer');
    await delay(1000);

    console.log(`Initial Join Room active users count: ${activeUsers.length}`);
    // Initially both offline! Wait, they never connected via socket, so they are OFFLINE.
    // If they are offline, non-follower should NOT be in active-users!
    const followerInMap = activeUsers.find(u => u._id === followerId);
    const nonFollowerInMap = activeUsers.find(u => u._id === nonFollowerId);

    if (followerInMap) console.log("✅ Offline Follower is correctly visible");
    else console.log("❌ Offline Follower is MISSING");

    if (!nonFollowerInMap) console.log("✅ Offline Non-Follower is correctly HIDDEN");
    else console.log("❌ Offline Non-Follower is VISIBLE (BUG!)");

    // Connect Non-Follower
    const nonFollSocket = io(SOCKET_URL, { query: { userId: nonFollowerId } });
    await new Promise(res => nonFollSocket.on('connect', res));
    await delay(1000);
    
    // Test API
    const apiRes = await axios.get(`${API_URL}/users/customers?lat=28.0&lng=77.0&retailerId=${retailerId}`, { headers: { Authorization: `Bearer ${retRes.data.token}` } });
    const apiCustomers = apiRes.data;
    
    const followerInApi = apiCustomers.find(u => u.id === followerId);
    const nonFollowerInApi = apiCustomers.find(u => u.id === nonFollowerId);
    
    if (followerInApi) console.log("✅ Offline Follower visible in API");
    else console.log("❌ Offline Follower missing in API");
    
    if (nonFollowerInApi) console.log("✅ Online Non-Follower visible in API");
    else console.log("❌ Online Non-Follower missing in API");

    retSocket.disconnect();
    nonFollSocket.disconnect();

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runTests();
