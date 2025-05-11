import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// 🔑 Interceptor to attach the CSRF token
api.interceptors.request.use((config) => {
  const token = getCookie("XSRF-TOKEN");
  if (token) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }
  return config;
});

// 🍪 Utility to read cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default api;
