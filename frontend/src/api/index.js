const API_URL = "http://localhost:5000/api";

export async function registerUser(formData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function loginUser(data) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getNearbyRetailers(lat, lng) {
  const res = await fetch(`${API_URL}/users/retailers?lat=${lat}&lng=${lng}`);
  return res.json();
}

export async function getNearbyCustomers(lat, lng) {
  const res = await fetch(`${API_URL}/users/customers?lat=${lat}&lng=${lng}`);
  return res.json();
}

export async function getInterestedCustomers(retailerId) {
  const res = await fetch(`${API_URL}/users/interested-customers?retailerId=${retailerId}`);
  return res.json();
}



export async function getUserProfile(userId) {
  const res = await fetch(`${API_URL}/users/${userId}`);
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export async function updateUserProfile(userId, data) {
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json();
}

export async function followRetailer(customerId, retailerId) {
  const res = await fetch(`${API_URL}/users/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId, retailerId }),
  });
  return res.json();
}
// In your api/index.js
export async function getAllUsers(lat, lng) {
  const res = await fetch(`http://localhost:5000/api/users/all?lat=${lat}&lng=${lng}`);
  return res.json();
}
export async function getAllOnlineUsers(role) {
  const res = await fetch(`${API_URL}/users/online?role=${role}`);
  return res.json();
}

export async function updateUserLocation(userId, lat, lng) {
  const res = await fetch(`${API_URL}/users/update-location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, lat, lng }),
  });
  return res.json();
}
