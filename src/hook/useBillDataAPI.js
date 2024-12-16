// hooks/useBillDataAPI.js
import { useState, useEffect } from 'react';
import { billCardService } from '../services/billCardService';

export const useBillDataAPI = () => {
    const [bills, setBills] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const data = await billCardService.getBillCards();
            setBills(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch bills:', err);
            setError("ไม่สามารถโหลดข้อมูลได้");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
        // Refresh ทุก 30 วินาที
        const intervalId = setInterval(fetchBills, 300000);
        return () => clearInterval(intervalId);
    }, []);

    const refreshBills = () => {
        fetchBills();
    };

    return { bills, error, loading, refreshBills };
};