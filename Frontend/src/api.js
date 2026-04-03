// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9090/api/v1.0",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const rawUser = localStorage.getItem("user");

  if (rawUser) {
    try {
      const parsedUser = JSON.parse(rawUser);
      if (parsedUser?.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    } catch {
      localStorage.removeItem("user");
    }
  }

  return config;
});

export const loginUser = (payload) => API.post("/login", payload);

export const registerUser = (payload) => API.post("/register", payload);

export const resetEmailOtp = (payload) => API.post(`/send-reset-otp?email=${payload.email}`, payload);

export const resetPassword = (payload) => API.post("/reset-password", payload);

export default API;
