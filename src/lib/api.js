import axios from "axios";

// export const API_BASE_URL = "https://inventory-ms-vbyw.onrender.com/api";
export const API_BASE_URL = "https://backend.nexiumglobal.us.cc/api";
// export const API_BASE_URL ="http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cookie support
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    
    return Promise.reject(
      error.response?.data?.message ||
      error.response?.data?.errors?.join(", ") ||
      "Something went wrong"
    );
  }
);

// Auth API
export const authApi = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }),
  register: (data) =>
    api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

export default api;
