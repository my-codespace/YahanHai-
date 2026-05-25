const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper wrapper to ensure all API calls include cookies credentials
async function fetchWithCredentials(url, options = {}) {
  return fetch(url, {
    ...options,
    credentials: "include"
  });
}

function getAuthHeaders(includeContentType = true) {
  const token = localStorage.getItem('token');
  const headers = {};
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function registerUser(formData) {
  const response = await fetchWithCredentials(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function loginUser(data) {
  const response = await fetchWithCredentials(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getNearbyRetailers(lat, lng) {
  const res = await fetchWithCredentials(`${API_URL}/users/retailers?lat=${lat}&lng=${lng}`, {
    headers: getAuthHeaders(false)
  });
  return res.json();
}

export async function getNearbyCustomers(lat, lng) {
  const res = await fetchWithCredentials(`${API_URL}/users/customers?lat=${lat}&lng=${lng}`, {
    headers: getAuthHeaders(false)
  });
  return res.json();
}

export async function getInterestedCustomers(retailerId) {
  const res = await fetchWithCredentials(`${API_URL}/users/interested-customers?retailerId=${retailerId}`, {
    headers: getAuthHeaders(false)
  });
  if (!res.ok) throw new Error(`Failed to fetch interested customers: ${res.statusText}`);
  return res.json();
}

export async function getFollowedRetailers(customerId) {
  const res = await fetchWithCredentials(`${API_URL}/users/followed-retailers?customerId=${customerId}`, {
    headers: getAuthHeaders(false)
  });
  if (!res.ok) throw new Error(`Failed to fetch followed retailers: ${res.statusText}`);
  return res.json();
}

export async function getUserProfile(userId) {
  const res = await fetchWithCredentials(`${API_URL}/users/${userId}`, {
    headers: getAuthHeaders(false)
  });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

export async function updateUserProfile(userId, data) {
  const res = await fetchWithCredentials(`${API_URL}/users/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save profile");
  return res.json();
}

export async function followRetailer(customerId, retailerId) {
  const res = await fetchWithCredentials(`${API_URL}/users/follow`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ customerId, retailerId }),
  });
  return res.json();
}

export async function unfollowRetailer(customerId, retailerId) {
  const res = await fetchWithCredentials(`${API_URL}/users/unfollow`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ customerId, retailerId }),
  });
  if (!res.ok) throw new Error('Failed to unfollow retailer');
  return res.json();
}

export async function getAllOnlineUsers(role) {
  const res = await fetchWithCredentials(`${API_URL}/users/online?role=${role}`, {
    headers: getAuthHeaders(false)
  });
  return res.json();
}

export async function updateUserLocation(userId, lat, lng) {
  const res = await fetchWithCredentials(`${API_URL}/users/update-location`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ userId, lat, lng }),
  });
  return res.json();
}

export async function getNotifications() {
  const res = await fetchWithCredentials(`${API_URL}/notifications`, {
    headers: getAuthHeaders(false)
  });
  if (!res.ok) throw new Error("Failed to load notifications");
  return res.json();
}

export async function markNotificationAsRead(notificationId) {
  const res = await fetchWithCredentials(`${API_URL}/notifications/${notificationId}/read`, {
    method: "PUT",
    headers: getAuthHeaders(true)
  });
  if (!res.ok) throw new Error("Failed to mark notification as read");
  return res.json();
}
