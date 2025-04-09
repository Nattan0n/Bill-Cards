// src/utils/axios.js
import axios from 'axios';

// สร้าง instance สำหรับ API ที่ server 129.200.6.51 (inventory API)
export const inventoryApi = axios.create({
    baseURL: 'http://129.200.6.51/laravel_oracle_api/public',
    // baseURL: 'http://129.200.6.51/laravel_oracle_api/public',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// สร้าง instance สำหรับ API ที่ server 129.200.6.52 (bill card API)
export const oracleApi = axios.create({
    baseURL: 'http://129.200.6.51/laravel_oracle_api/public',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// สร้าง instance สำหรับ API ที่ server 129.200.6.50 (image API)
export const imageApi = axios.create({
    baseURL: 'http://129.200.6.50:83',
    headers: {
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest'
    },
    validateStatus: function (status) {
        return status >= 200 && status < 300;
    }
});

// ฟังก์ชันจัดการ error สำหรับทุก API
const handleApiError = (error) => {
    if (error.code === 'ERR_NETWORK') {
        console.error('Network error:', error);
    }
    if (error.response?.status === 401) {
        window.location.href = '/login';
    }
    return Promise.reject(error);
};

// เพิ่ม interceptors สำหรับทุก API
inventoryApi.interceptors.response.use(
    response => response,
    handleApiError
);

oracleApi.interceptors.response.use(
    response => response,
    handleApiError
);

imageApi.interceptors.response.use(
    response => response,
    handleApiError
);

// ฟังก์ชันสำหรับดึงรูปภาพ
export const getImageUrl = async (identifier) => {
    try {
        const response = await imageApi.get(`/images/${identifier}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
    }
};

// ส่งออก oracleApi เป็น default export เพื่อความเข้ากันได้กับโค้ดเดิม
export default oracleApi;