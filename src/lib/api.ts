import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
});

// Request interceptor — attach token
api.interceptors.request.use(
    (config: any) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: any) => Promise.reject(error)
);

// Response interceptor — auto-logout on 401
api.interceptors.response.use(
    (response) => response,
    (error: any) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Hard reload → triggers checkAuth() which shows LoginPage
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
