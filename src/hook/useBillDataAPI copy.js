// hooks/useBillDataAPI.js
import { useState, useEffect } from 'react';

export const useBillDataAPI = () => {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch("/api/billcard");
        if (!response.ok) {
          throw new Error('Failed to load bills');
        }
        const data = await response.json();
        setBills(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load bills.");
      } finally {
        setLoading(false);
      }
    };

    fetchBills();

    const intervalId = setInterval(fetchBills, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const refreshBills = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/billcard");
      if (!response.ok) {
        throw new Error('Failed to load bills');
      }
      const data = await response.json();
      setBills(data);
    } catch (err) {
      console.error(err);
      setError("Failed to refresh bills.");
    } finally {
      setLoading(false);
    }
  };

  return { bills, error, loading, refreshBills };
};