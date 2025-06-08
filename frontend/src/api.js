// frontend/src/api.js
const API_URL = "http://localhost:5000/api";

export async function registerUser(formData) { // Receive FormData directly
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData, // ✅ Let browser set Content-Type to multipart/form-data
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
