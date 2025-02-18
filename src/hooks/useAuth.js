import { useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://129.200.6.50:83',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const checkAuth = async () => {
        try {
            // ดึง CSRF token ก่อน
            await api.get('/sanctum/csrf-cookie');
            
            // ดึงข้อมูล user
            const response = await api.get('/api/user');
            console.log('User data:', response.data);
            setUser(response.data.user);
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message);
            // ถ้าไม่มีสิทธิ์เข้าถึง (401) ให้ redirect ไปหน้า login
            if (err.response?.status === 401) {
                window.location.href = 'http://129.200.6.50:83/login';
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return { user, loading, error };
};