// Petite couche d'accès à l'API backend.
// Change API_BASE_URL si ton backend tourne ailleurs (ex: en production).
const API_BASE_URL = window.SCHOLARPASS_API_URL || "http://localhost:4000/api";

const Auth = {
  getToken: () => localStorage.getItem("sp_token"),
  setToken: (t) => localStorage.setItem("sp_token", t),
  getUser: () => JSON.parse(localStorage.getItem("sp_user") || "null"),
  setUser: (u) => localStorage.setItem("sp_user", JSON.stringify(u)),
  logout: () => {
    localStorage.removeItem("sp_token");
    localStorage.removeItem("sp_user");
    window.location.href = "index.html";
  },
  requireAuth: () => {
    if (!Auth.getToken()) window.location.href = "index.html";
  },
};

async function apiRequest(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
  return data;
}

const Api = {
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload }),
  getProfile: () => apiRequest("/profile"),
  updateProfile: (section, data) => apiRequest("/profile", { method: "PUT", body: { section, data } }),
  getScholarships: (params = "") => apiRequest(`/scholarships${params}`),
  getRecommended: () => apiRequest("/scholarships/recommended/for-me"),
  getApplications: () => apiRequest("/applications"),
  createApplication: (scholarshipId) =>
    apiRequest("/applications", { method: "POST", body: { scholarshipId } }),
  updateApplication: (id, payload) => apiRequest(`/applications/${id}`, { method: "PUT", body: payload }),
  uploadDocument: (formData) => apiRequest("/documents", { method: "POST", body: formData, isForm: true }),
  novaChat: (message, history) =>
    apiRequest("/agents/chat", { method: "POST", body: { message, history } }),
  onboarding: (answer) => apiRequest("/agents/onboarding", { method: "POST", body: { answer } }),
  analyzeStrengths: (freeText) => apiRequest("/agents/strengths", { method: "POST", body: { freeText } }),
};
