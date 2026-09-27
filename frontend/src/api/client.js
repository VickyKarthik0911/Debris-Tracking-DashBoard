import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export const api = {
  getObjects: (params = {}) => client.get("/objects", { params }).then((r) => r.data),
  getRiskAnalysis: () => client.get("/risk-analysis").then((r) => r.data),
};
