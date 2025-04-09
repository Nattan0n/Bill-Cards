// useBillDataAPI.js ที่ปรับปรุงแล้ว
import { useState, useEffect, useCallback, useRef } from 'react';
import { billCardService } from '../services/billCardService';
import { inventoryService } from '../services/inventoryService';
import { directAccessService } from '../services/directAccessService';

export const useBillDataAPI = (initialSubInventory = "GP-DAIK") => {
    const [bills, setBills] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subInventory, setSubInventory] = useState(initialSubInventory);
    const [selectedItemId, setSelectedItemId] = useState(null);
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

             // เพิ่ม delay เล็กน้อยเพื่อให้แน่ใจว่า API request ไม่ถูกยกเลิกเร็วเกินไป
    await new Promise(resolve => setTimeout(resolve, 200));

            // Step 1: Get inventory data first (API 1)
            const inventories = await inventoryService.fetchInventories();
            if (!inventories || inventories.length === 0) {
                throw new Error("ไม่สามารถดึงข้อมูล Inventory ได้");
              }
              
              const currentInventory = inventories.find(inv => inv.secondary_inventory === subInventory);
          
              if (!currentInventory?.inventory_items) {
                throw new Error(`ไม่พบรายการ items สำหรับ subinventory: ${subInventory}`);
              }

            if (!currentInventory?.inventory_items) {
                throw new Error(`No items found for subinventory: ${subInventory}`);
            }

            // If we have a selected item ID, fetch its bill card data (API 2)
            if (selectedItemId) {
                // Fetch bill card data from API 2
                const billCardData = await directAccessService.getBillCards(
                    subInventory,
                    selectedItemId
                );

                if (billCardData && billCardData.length > 0) {
                    // Find inventory data for the selected item to get stk_qty
                    const inventoryItem = currentInventory.inventory_items.find(
                        item => item.part_number === billCardData[0].M_PART_NUMBER ||
                              item.inventory_item_id === billCardData[0].inventory_item_id
                    );
                    
                    // Map and merge stk_qty from inventory data (API 1) with bill card data (API 2)
                    const mergedBills = billCardData.map(bill => {
                        // Find matching inventory item to get stk_qty
                        const matchingItem = inventoryItem || {};
                        let stockQty = "0"; // กำหนดค่าเริ่มต้นเป็น "0"
                        
                        // พยายามใช้ค่า stk_qty จาก bill ก่อน ถ้าไม่มีให้ใช้จาก inventory
                        const rawValue = bill.stk_qty || matchingItem.stk_qty || "0";
                        
                        // ถ้ามีค่า stk_qty และสามารถแปลงเป็นตัวเลขได้
                        try {
                            const numericValue = String(rawValue).replace(/[^\d.-]/g, '');
                            if (numericValue && !isNaN(parseFloat(numericValue))) {
                                stockQty = numericValue;
                            }
                        } catch (e) {
                            console.error("Error parsing stk_qty in useBillDataAPI:", e);
                        }
                        
                        return {
                            ...bill,
                            stk_qty: stockQty // ใช้ค่าที่แปลงแล้ว
                        };
                    });
                    
                    if (mountedRef.current && !signal?.aborted) {
                        setBills(mergedBills);
                    }
                } else {
                    // No bill card data found, create empty records with inventory data
                    const inventoryItem = currentInventory.inventory_items.find(
                        item => item.part_number === selectedItemId || 
                              item.inventory_item_id === selectedItemId
                    );

                    if (inventoryItem) {
                        // แปลงค่า stk_qty
                        let stockQty = "0"; // กำหนดค่าเริ่มต้นเป็น "0"
                        
                        // ถ้ามีค่า stk_qty และสามารถแปลงเป็นตัวเลขได้
                        if (inventoryItem.stk_qty) {
                            try {
                                const numericValue = String(inventoryItem.stk_qty).replace(/[^\d.-]/g, '');
                                if (numericValue && !isNaN(parseFloat(numericValue))) {
                                    stockQty = numericValue;
                                }
                            } catch (e) {
                                console.error("Error parsing stk_qty in empty record:", e);
                            }
                        }
                        
                        const emptyBill = {
                            M_PART_NUMBER: inventoryItem.part_number,
                            M_PART_DESCRIPTION: inventoryItem.part_description,
                            M_SUBINV: subInventory,
                            M_DATE: new Date().toISOString(),
                            M_QTY: "0",
                            inventory_item_id: inventoryItem.inventory_item_id,
                            stk_qty: stockQty, // ใช้ค่าที่แปลงแล้ว
                            TRANSACTION_TYPE_NAME: "Initial",
                            begin_qty: "0",
                            totalQty: 0,
                            _noTransactions: true
                        };
                        
                        if (mountedRef.current && !signal?.aborted) {
                            setBills([emptyBill]);
                        }
                    } else {
                        throw new Error(`No data found for selected item: ${selectedItemId}`);
                    }
                }
            } else {
                // Create mock bills data from inventory items if no specific item is selected
                const mockBills = currentInventory.inventory_items.map((item, index) => {
                    // แปลงค่า stk_qty
                    let stockQty = "0"; // กำหนดค่าเริ่มต้นเป็น "0"
                    
                    // ถ้ามีค่า stk_qty และสามารถแปลงเป็นตัวเลขได้
                    if (item.stk_qty) {
                        try {
                            const numericValue = String(item.stk_qty).replace(/[^\d.-]/g, '');
                            if (numericValue && !isNaN(parseFloat(numericValue))) {
                                stockQty = numericValue;
                            }
                        } catch (e) {
                            console.error("Error parsing stk_qty in mock bills:", e);
                        }
                    }
                    
                    return {
                        M_PART_NUMBER: item.part_number,
                        M_PART_DESCRIPTION: item.part_description,
                        M_SUBINV: subInventory,
                        M_DATE: new Date().toISOString(),
                        M_QTY: "0",
                        totalQty: 0,
                        M_ID: `${index + 1}`,
                        TRANSACTION_TYPE_NAME: "Initial",
                        inventory_item_id: item.inventory_item_id,
                        stk_qty: stockQty, // ใช้ค่าที่แปลงแล้ว
                    };
                });

                if (mountedRef.current && !signal?.aborted) {
                    setBills(mockBills);
                }
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
    }, [subInventory, selectedItemId]);

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
        setSubInventory,
        selectedItemId,
        setSelectedItemId
    };
};