// frontend/src/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function fetchWrapper(url, options) {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      // If it's not JSON (e.g. 502 Bad Gateway HTML)
      return { msg: `Server error: ${response.status} ${response.statusText}` };
    }
    
    if (!response.ok) {
      return { msg: data.msg || 'An error occurred' };
    }
    return data;
  } catch (err) {
    return { msg: 'Network error or server is unreachable' };
  }
}

export async function registerUser(formData) {
  return await fetchWrapper(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData,
  });
}

export async function loginUser(data) {
  return await fetchWrapper(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// Added getUserProfile to resolve the missing import error shown earlier in Dashboard.js
export async function getUserProfile(userId) {
  return await fetchWrapper(`${API_URL}/users/${userId}`, {
    method: "GET",
  });
}

export async function updateUserLocation(userId, lat, lng) {
  return await fetchWrapper(`${API_URL}/users/update-location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, lat, lng }),
  });
}
