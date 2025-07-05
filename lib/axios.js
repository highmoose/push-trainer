import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// 🔑 Interceptor to attach the CSRF token and Authorization token
api.interceptors.request.use((config) => {
  // Get CSRF token
  const csrfToken = getCookie("XSRF-TOKEN");
  if (csrfToken) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
  }

  // Get auth token from localStorage
  const authToken = localStorage.getItem("auth_token");
  if (authToken) {
    config.headers["Authorization"] = `Bearer ${authToken}`;
  }

  return config;
});

// 🍪 Utility to read cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default api;
