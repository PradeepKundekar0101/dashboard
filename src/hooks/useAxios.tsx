import axios from "axios";
import { config } from "@/config";
export const api = axios.create({
  baseURL: `${config.apiServer}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    timeout: 1000,
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const forexApi = axios.create({
  baseURL: `${config.forexServer}/api/`,
  headers: {
    "Content-Type": "application/json",
    timeout: 1000,
  },
});
