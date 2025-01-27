// hooks/useBillDetailAPI.js
import { useState, useEffect } from "react";

export const useBillDetailAPI = (partNumber) => {
  const [bill, setBill] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillDetail = async () => {
      if (!partNumber) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/billcard/${partNumber}`);
        if (!response.ok) {
          throw new Error("Failed to load bill detail");
        }
        const data = await response.json();
        setBill(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load bill detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchBillDetail();

    const intervalId = setInterval(fetchBillDetail, 30000);

    return () => clearInterval(intervalId);
  }, [partNumber]);

  const refreshBill = async () => {
    if (!partNumber) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/billcard/${partNumber}`);
      if (!response.ok) {
        throw new Error("Failed to load bill detail");
      }
      const data = await response.json();
      setBill(data);
    } catch (err) {
      console.error(err);
      setError("Failed to refresh bill detail.");
    } finally {
      setLoading(false);
    }
  };

  return { bill, error, loading, refreshBill };
};