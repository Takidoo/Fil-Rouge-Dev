import axios from "axios";
import { authStorage } from "../utils/storage";

export const apiClient = axios.create({
  baseURL: "",
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && authStorage.getToken()) {
      authStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
