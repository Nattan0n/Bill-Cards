// authService.js
import axios from 'axios';

const BASE_URL = 'http://129.200.6.50:83';

// สร้าง axios instance with optimized config
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    // เพิ่ม timeout และ retry config
    timeout: 10000,
    retryDelay: 1000,
    maxRetries: 3
});

// เพิ่ม request interceptor เพื่อจัดการ token
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('XSRF-TOKEN');
        if (token) {
            config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
        }
        return config;
    },
    error => Promise.reject(error)
);

// ปรับปรุง response interceptor
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true;
            await authService.getCsrfToken();
            return api(originalRequest);
        }
        
        return Promise.reject(error);
    }
);

export const authService = {
    getCsrfToken: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
                withCredentials: true
            });
            
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];
            
            if (token) {
                const decodedToken = decodeURIComponent(token);
                localStorage.setItem('XSRF-TOKEN', decodedToken);
                api.defaults.headers['X-XSRF-TOKEN'] = decodedToken;
            }
            
            return response;
        } catch (error) {
            console.error('Error getting CSRF token:', error);
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            const cachedUser = sessionStorage.getItem('currentUser');
            if (cachedUser) {
                return JSON.parse(cachedUser);
            }

            const response = await api.get('/api/user');
            sessionStorage.setItem('currentUser', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            await authService.getCsrfToken();
            const response = await api.post('/logout');
            
            // Clear all storage
            localStorage.removeItem('XSRF-TOKEN');
            sessionStorage.removeItem('currentUser');
            
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = `${BASE_URL}/login`;
            throw error;
        }
    }
};

export default api;