// hooks/useBillData.js
import { useState, useEffect } from 'react';

export const useBillData = () => {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch("/data/BillData.json");
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
  }, []);

  return { bills, error, loading };
};