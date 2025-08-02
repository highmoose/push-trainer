import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // API server port
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// 🔑 Interceptor to attach the CSRF token and Authorization token
api.interceptors.request.use((config) => {
  console.log(
    "📤 Making API request:",
    config.method?.toUpperCase(),
    config.url
  );

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

// Add response interceptor to log responses and errors
api.interceptors.response.use(
  (response) => {
    console.log(
      "📥 API response:",
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status
    );
    return response;
  },
  (error) => {
    console.error(
      "❌ API error:",
      error.config?.method?.toUpperCase(),
      error.config?.url,
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

// 🍪 Utility to read cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default api;
