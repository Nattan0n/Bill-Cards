import { useState, useEffect, useCallback, useRef } from 'react';
import { billCardService } from '../services/billCardService';
import { inventoryService } from '../services/inventoryService';

export const useBillDataAPI = (initialSubInventory = "GP-DAIK") => {
    const [bills, setBills] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subInventory, setSubInventory] = useState(initialSubInventory);
    const abortController = useRef(null);
    const mountedRef = useRef(true);

    const fetchBillData = useCallback(async (signal) => {
        if (!subInventory) {
            setBills([]);
            setLoading(false);
            return;
        }

        try {
            if (!mountedRef.current) return;
            setLoading(true);
            setError(null);

            // Get inventory data first
            const inventories = await inventoryService.fetchInventories();
            const currentInventory = inventories.find(inv => inv.secondary_inventory === subInventory);

            if (!currentInventory?.inventory_items) {
                throw new Error(`No items found for subinventory: ${subInventory}`);
            }

            // Create mock bills data from inventory items
            const mockBills = currentInventory.inventory_items.map((item, index) => ({
                M_PART_NUMBER: item.part_number,
                M_PART_DESCRIPTION: item.part_description,
                M_SUBINV: subInventory,
                M_DATE: new Date().toISOString(),
                M_QTY: "0",
                totalQty: 0,
                M_ID: `${index + 1}`,
                TRANSACTION_TYPE_NAME: "Initial",
                inventory_item_id: item.inventory_item_id
            }));

            if (mountedRef.current && !signal?.aborted) {
                setBills(mockBills);
            }
        } catch (err) {
            if (mountedRef.current && !signal?.aborted) {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    console.error('Bill data fetch error:', err);
                    const errorMessage = err.response?.data?.message || 
                                      err.message || 
                                      'Failed to fetch bill data';
                    setError(errorMessage);
                }
            }
        } finally {
            if (mountedRef.current && !signal?.aborted) {
                setLoading(false);
            }
        }
    }, [subInventory]);

    useEffect(() => {
        mountedRef.current = true;

        if (abortController.current) {
            abortController.current.abort();
        }

        abortController.current = new AbortController();
        fetchBillData(abortController.current.signal);

        const refreshInterval = setInterval(() => {
            if (document.visibilityState === 'visible' && mountedRef.current && subInventory) {
                if (abortController.current) {
                    abortController.current.abort();
                }
                abortController.current = new AbortController();
                fetchBillData(abortController.current.signal);
            }
        }, 300000); // 5 minutes

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && mountedRef.current && subInventory) {
                if (abortController.current) {
                    abortController.current.abort();
                }
                abortController.current = new AbortController();
                fetchBillData(abortController.current.signal);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            mountedRef.current = false;
            if (abortController.current) {
                abortController.current.abort();
            }
            clearInterval(refreshInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchBillData, subInventory]);

    const refreshBills = useCallback(() => {
        if (!mountedRef.current || !subInventory) return;

        if (abortController.current) {
            abortController.current.abort();
        }
        abortController.current = new AbortController();
        return fetchBillData(abortController.current.signal);
    }, [fetchBillData, subInventory]);

    return {
        bills,
        error,
        loading,
        refreshBills,
        setSubInventory
    };
};