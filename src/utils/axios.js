// 1. src/services/axios.js
import axios from 'axios';

export const oracleApi = axios.create({
    baseURL: 'http://129.200.6.52/laravel_oracle11g_prod_api/public',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

export const imageApi = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest'
    },
    validateStatus: function (status) {
        return status >= 200 && status < 300;
    }
});

const handleApiError = (error) => {
    if (error.code === 'ERR_NETWORK') {
        console.error('Network error:', error);
    }
    if (error.response?.status === 401) {
        window.location.href = '/login';
    }
    return Promise.reject(error);
};

oracleApi.interceptors.response.use(
    response => response,
    handleApiError
);

imageApi.interceptors.response.use(
    response => response,
    handleApiError
);

export const getImageUrl = async (identifier) => {
    try {
        const response = await imageApi.get(`/images/${identifier}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
    }
};

export default oracleApi;
