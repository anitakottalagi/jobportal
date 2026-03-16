import axios from 'axios';

// Use env variable in production, fallback to localhost in dev
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach stored JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth APIs ────────────────────────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// ─── Profile APIs ─────────────────────────────────────────────────────────────
export const getProfile = () => api.get('/profile');
export const createProfile = (data) => api.post('/profile', data);
export const updateProfile = (id, data) => api.put(`/profile/${id}`, data);

// ─── Job APIs ─────────────────────────────────────────────────────────────────
export const getJobs = () => api.get('/jobs');
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const fetchJobsFromAPI = () => api.post('/jobs/fetch-from-api');

// ─── Application APIs ─────────────────────────────────────────────────────────
export const getApplications = () => api.get('/applications');
export const createApplication = (data) => api.post('/applications', data);
export const deleteApplication = (id) => api.delete(`/applications/${id}`);

export default api;
