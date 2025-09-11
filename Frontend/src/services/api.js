import axios from "axios";
import { getLoading } from "../Context/loadingContext";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const control = getLoading();
    if (control) control.setLoading(true);

    return config;
  },
  (error) => {
    const control = getLoading();
    if (control) control.setLoading(false);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    const control = getLoading();
    if (control) control.setLoading(false);
    return response;
  },
  (error) => {
    const control = getLoading();
    if (control) control.setLoading(false);
    return Promise.reject(error);
  }
);

export default API;
