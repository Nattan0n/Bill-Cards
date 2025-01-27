// services/billCardService.js
import axios from '../utils/axios';

const billCardsCache = new Map();
let isFetching = false;

export const billCardService = {
    getBillCards: async (subInventory = null, year = null, page = 1) => {
        try {
            const queryYear = year || new Date().getFullYear();
            const cacheKey = `${subInventory || 'all'}-${queryYear}-${page}`;
            
            // ตรวจสอบ cache
            if (billCardsCache.has(cacheKey)) {
                console.log(`Returning ${cacheKey} data from cache:`, billCardsCache.get(cacheKey));
                return billCardsCache.get(cacheKey);
            }

            console.log(`Fetching data for ${subInventory || 'all'} in year ${queryYear}, page ${page}...`);

            // สร้าง URL พร้อม query parameters
            const params = new URLSearchParams();
            if (subInventory) {
                params.append('data', subInventory);
            }
            params.append('year', queryYear);
            params.append('page', page);
            
            const response = await axios.get(`/api/oracle/bill-cards?${params.toString()}`);
            
            if (!response.data || response.status === 204) {
                return {
                    data: [],
                    pagination: { current_page: 1, total_pages: 1, total_items: 0, per_page: 10 }
                };
            }

            // แปลงข้อมูล
            const mappedData = (response.data.bill_cards || []).map(item => ({
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

            const result = {
                data: mappedData,
                pagination: {
                    current_page: Number(response.data.current_page) || 1,
                    total_pages: Number(response.data.last_page) || 1,
                    total_items: Number(response.data.total_count) || 0,
                    per_page: Number(response.data.per_page) || 10
                }
            };

            // เก็บข้อมูลใน cache
            billCardsCache.set(cacheKey, result);
            console.log(`Cached ${mappedData.length} records for ${cacheKey}`);
            
            return result;
        } catch (error) {
            console.error('Error fetching bill cards:', error);
            return {
                data: [],
                pagination: { current_page: 1, total_pages: 1, total_items: 0, per_page: 10 }
            };
        }
    },

    clearCache: (subInventory = null, year = null) => {
        if (subInventory && year) {
            // ล้าง cache ทั้งหมดที่เกี่ยวข้องกับ subInventory และปีที่ระบุ
            for (const key of billCardsCache.keys()) {
                if (key.startsWith(`${subInventory}-${year}`)) {
                    billCardsCache.delete(key);
                }
            }
        } else if (subInventory) {
            // ล้าง cache ทั้งหมดของ subInventory นั้น
            for (const key of billCardsCache.keys()) {
                if (key.startsWith(`${subInventory}-`)) {
                    billCardsCache.delete(key);
                }
            }
        } else {
            billCardsCache.clear();
        }
    }
};