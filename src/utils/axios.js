// src/utils/axios.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://129.200.6.52/laravel_oracle11g_prod_api/public',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Add error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Handle unauthorized
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;