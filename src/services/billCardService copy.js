// services/billCardService.js
import axios from '../utils/axios';

const billCardsCache = new Map();
let isFetching = false;

export const billCardService = {
    getBillCards: async (subInventory = null, year = null) => {
        const queryYear = year || new Date().getFullYear();
        const cacheKey = `${subInventory || 'all'}-${queryYear}`;
        
        if (billCardsCache.has(cacheKey)) {
            console.log(`Returning ${cacheKey} data from cache:`, billCardsCache.get(cacheKey));
            return billCardsCache.get(cacheKey);
        }

        try {
            isFetching = true;
            console.log(`Fetching data for ${subInventory || 'all'} in year ${queryYear}...`);

            // สร้าง URL พร้อม query parameters
            const baseUrl = '/api/oracle/bill-cards';
            const params = new URLSearchParams();
            
            if (subInventory) {
                params.append('data', subInventory);
            }
            params.append('year', queryYear);
            
            const url = `${baseUrl}?${params.toString()}`;
            const response = await axios.get(url);
            console.log('API Response:', response.data);

            // ตรวจสอบและแปลงข้อมูล
            const billCardsData = response.data.bill_cards || [];
            
            const mappedData = billCardsData.map(item => ({
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

            // เก็บข้อมูลใน cache
            billCardsCache.set(cacheKey, mappedData);
            console.log(`Cached ${mappedData.length} records for ${cacheKey}`);
            
            return mappedData;
        } catch (error) {
            console.error('Error fetching bill cards:', error);
            throw error;
        } finally {
            isFetching = false;
        }
    },

    // ปรับปรุง clearCache ให้รองรับการล้าง cache ตามปี
    clearCache: (subInventory = null, year = null) => {
        if (subInventory && year) {
            // ล้าง cache เฉพาะ subInventory และปีที่ระบุ
            const cacheKey = `${subInventory}-${year}`;
            billCardsCache.delete(cacheKey);
            console.log(`Cache cleared for ${subInventory} in year ${year}`);
        } else if (subInventory) {
            // ล้าง cache ทั้งหมดของ subInventory นั้น
            for (const key of billCardsCache.keys()) {
                if (key.startsWith(`${subInventory}-`)) {
                    billCardsCache.delete(key);
                }
            }
            console.log(`Cache cleared for all years of ${subInventory}`);
        } else {
            // ล้าง cache ทั้งหมด
            billCardsCache.clear();
            console.log("All cache cleared");
        }
    }
};