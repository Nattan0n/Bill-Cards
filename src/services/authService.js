import axios from 'axios';

// สร้าง axios instance
const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// อินเตอร์เซปเตอร์สำหรับจัดการ CSRF token
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 419) {
            await authService.getCsrfToken();
            const config = error.config;
            return api(config);
        }
        return Promise.reject(error);
    }
);

export const authService = {
    getCsrfToken: async () => {
        try {
            await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
                withCredentials: true
            });
            // ดึง token จาก cookie และเพิ่มเข้าไปใน default headers
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];
            
            if (token) {
                api.defaults.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
            }
        } catch (error) {
            console.error('Error getting CSRF token:', error);
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            const response = await api.get('/api/user');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            // ขอ CSRF token ก่อนทำการ logout
            await authService.getCsrfToken();
            
            // ส่ง request logout
            const response = await api.post('/logout');
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            // ถ้าเกิด error แต่ต้องการให้ logout ไม่ว่าอะไรจะเกิดขึ้น
            window.location.href = 'http://localhost:8000/login';
            throw error;
        }
    }
};

export default api;