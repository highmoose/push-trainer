import api from "./axios";

export async function login(email, password) {
  // Get CSRF cookie first
  await api.get("/sanctum/csrf-cookie");

  // Then submit login to API route
  const res = await api.post("/api/login", {
    email,
    password,
  });

  return res.data;
}

export async function logout() {
  await api.post("/api/logout");
}

export async function getUser() {
  const res = await api.get("/api/user");
  return res.data;
}

export async function register(name, email, password, role) {
  await api.get("/sanctum/csrf-cookie");

  const res = await api.post("/api/register", {
    name,
    email,
    password,
    password_confirmation: password,
    role,
  });

  return res.data;
}
