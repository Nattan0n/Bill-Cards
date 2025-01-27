// useBillDataAPI.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { billCardService } from '../services/billCardService';

export const useBillDataAPI = (initialSubInventory = "GP-DAIK") => {
    const [bills, setBills] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subInventory, setSubInventory] = useState(initialSubInventory);
    const abortController = useRef(null);

    const fetchBills = useCallback(async (signal) => {
        try {
            setLoading(true);
            setError(null);
            const data = await billCardService.getBillCards(subInventory);
            if (!signal.aborted) {
                setBills(data);
            }
        } catch (err) {
            if (!signal.aborted) {
                setError(err.message);
                console.error('Failed to fetch bills:', err);
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, [subInventory]);

    useEffect(() => {
        abortController.current = new AbortController();
        fetchBills(abortController.current.signal);

        const refreshInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchBills(abortController.current.signal);
            }
        }, 5000000); // 5 minutes

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchBills(abortController.current.signal);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            abortController.current.abort();
            clearInterval(refreshInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchBills]);

    const refreshBills = useCallback(() => {
        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();
        return fetchBills(abortController.current.signal);
    }, [fetchBills]);

    return {
        bills,
        error,
        loading,
        refreshBills,
        setSubInventory
    };
};