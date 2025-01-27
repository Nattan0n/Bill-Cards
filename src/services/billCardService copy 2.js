// services/billCardService.js
import axios from '../utils/axios';

const billCardsCache = new Map();
let isFetching = false;

export const billCardService = {
    getBillCards: async (subInventory = null, year = null) => {
        const queryYear = year || new Date().getFullYear();
        const cacheKey = `${subInventory || 'all'}-${queryYear}`;
        
        if (billCardsCache.has(cacheKey)) {
            return billCardsCache.get(cacheKey);
        }

        try {
            isFetching = true;
            console.log(`Fetching paginated data for ${subInventory || 'all'} in year ${queryYear}...`);

            const allBillCards = [];
            let currentPage = 1;
            let hasMorePages = true;

            // ดึงข้อมูลทีละหน้าจนกว่าจะครบ
            while (hasMorePages) {
                const params = new URLSearchParams();
                if (subInventory) {
                    params.append('data', subInventory);
                }
                params.append('year', queryYear);
                params.append('page', currentPage);

                const response = await axios.get(`/api/oracle/bill-cards?${params.toString()}`);
                const pageData = response.data;

                if (pageData.bill_cards && pageData.bill_cards.length > 0) {
                    allBillCards.push(...pageData.bill_cards);
                }

                // ตรวจสอบว่ามีหน้าถัดไปหรือไม่
                hasMorePages = currentPage < pageData.last_page;
                currentPage++;

                // แสดงความคืบหน้า
                console.log(`Fetched page ${currentPage - 1} of ${pageData.last_page}`);
            }

            // แปลงข้อมูลและคำนวณยอดคงเหลือ
            const processedData = allBillCards.map(item => ({
                M_PART_NUMBER: item.m_part_number || '',
                M_PART_DESCRIPTION: item.m_part_description || '',
                M_SUBINV: item.m_subinv || '',
                M_DATE: item.m_date || '',
                M_QTY: item.m_qty || '0',
                M_QTY_RM: item.m_qty_rm || '0',
                M_ID: item.m_id || '',
                M_SOURCE_ID: item.m_source_id || '',
                M_SOURCE_NAME: item.m_source_name || '',
                M_SOURCE_LINE_ID: item.m_source_line_id || '',
                M_TYPE_ID: item.m_type_id || '',
                TRANSACTION_TYPE_NAME: item.m_type_name || '',
                M_USER_NAME: item.user_name || '',
                M_PART_IMG: item.m_part_number ? `/images/${item.m_part_number}.png` : ''
            }));

            // คำนวณยอดคงเหลือของแต่ละ part
            const partTotals = new Map();
            processedData.forEach(item => {
                const qty = parseFloat(item.M_QTY) || 0;
                const currentTotal = partTotals.get(item.M_PART_NUMBER) || 0;
                partTotals.set(item.M_PART_NUMBER, currentTotal + qty);
            });

            // เพิ่มข้อมูลยอดคงเหลือเข้าไปในแต่ละรายการ
            const finalData = processedData.map(item => ({
                ...item,
                RUNNING_TOTAL: partTotals.get(item.M_PART_NUMBER) || 0
            }));

            // เก็บข้อมูลใน cache
            billCardsCache.set(cacheKey, finalData);
            console.log(`Cached ${finalData.length} total records for ${cacheKey}`);
            
            return finalData;
        } catch (error) {
            console.error('Error fetching bill cards:', error);
            throw error;
        } finally {
            isFetching = false;
        }
    },

    // เพิ่มฟังก์ชันสำหรับดึงข้อมูลแบบ real-time (ไม่ใช้ cache) สำหรับกรณีที่ต้องการข้อมูลล่าสุด
    getRealTimeBillCards: async (subInventory, page = 1) => {
        try {
            const params = new URLSearchParams();
            if (subInventory) {
                params.append('data', subInventory);
            }
            params.append('page', page);

            const response = await axios.get(`/api/oracle/bill-cards?${params.toString()}`);
            return {
                data: response.data.bill_cards,
                pagination: {
                    currentPage: response.data.current_page,
                    lastPage: response.data.last_page,
                    totalCount: response.data.total_count,
                    perPage: response.data.per_page
                }
            };
        } catch (error) {
            console.error('Error fetching real-time bill cards:', error);
            throw error;
        }
    },

    clearCache: (subInventory = null, year = null) => {
        if (subInventory && year) {
            const cacheKey = `${subInventory}-${year}`;
            billCardsCache.delete(cacheKey);
            console.log(`Cache cleared for ${subInventory} in year ${year}`);
        } else if (subInventory) {
            for (const key of billCardsCache.keys()) {
                if (key.startsWith(`${subInventory}-`)) {
                    billCardsCache.delete(key);
                }
            }
            console.log(`Cache cleared for all years of ${subInventory}`);
        } else {
            billCardsCache.clear();
            console.log("All cache cleared");
        }
    }
};