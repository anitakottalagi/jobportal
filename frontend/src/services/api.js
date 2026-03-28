import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach user token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper: axios instance with admin token
const adminApi = () => {
  const token = localStorage.getItem('adminToken');
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    timeout: 15000,
  });
};

// --- User Auth ---
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// --- Profile ---
export const getProfile = () => api.get('/profile');
export const createProfile = (data) => api.post('/profile', data);
export const updateProfile = (id, data) => api.put(`/profile/${id}`, data);

// --- Jobs ---
export const getJobs = () => api.get('/jobs');
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const fetchJobsFromAPI = () => api.post('/jobs/fetch-from-api');

// --- Applications ---
export const getApplications = () => api.get('/applications');
export const createApplication = (data) => api.post('/applications', data);
export const deleteApplication = (id) => api.delete(`/applications/${id}`);

// --- Admin Auth ---
export const adminLoginApi = (data) => api.post('/admin/auth/login', data);
export const adminRegister = (data) => api.post('/admin/auth/register', data);

// --- Admin Actions ---
export const adminGetApplications = () => adminApi().get('/admin/applications');
export const adminRespondToApplication = (id, data) => adminApi().put(`/admin/applications/${id}/respond`, data);
export const adminAddJob = (data) => adminApi().post('/admin/jobs', data);
export const adminGetJobs = () => adminApi().get('/admin/jobs');

export default api;
