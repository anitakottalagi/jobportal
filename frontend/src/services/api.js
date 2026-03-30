import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


const adminApi = () => axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});


export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

export const getProfile = () => api.get('/profile');
export const createProfile = (data) => api.post('/profile', data);
export const updateProfile = (id, data) => api.put(`/profile/${id}`, data);

export const getJobs = () => api.get('/jobs');
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const fetchJobsFromAPI = () => api.post('/jobs/fetch-from-api');

export const getApplications = () => api.get('/applications');
export const createApplication = (data) => api.post('/applications', data);
export const deleteApplication = (id) => api.delete(`/applications/${id}`);

export const adminLoginApi = (data) => api.post('/admin/auth/login', data);
export const adminRegister = (data) => api.post('/admin/auth/register', data);

export const adminGetApplications = () => adminApi().get('/admin/applications');
export const adminRespondToApplication = (id, data) => adminApi().put(`/admin/applications/${id}/respond`, data);
export const adminAddJob = (data) => adminApi().post('/admin/jobs', data);
export const adminGetJobs = () => adminApi().get('/admin/jobs');

export default api;
