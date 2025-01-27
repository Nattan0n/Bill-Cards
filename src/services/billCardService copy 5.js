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
            const baseUrl = '/api/oracle/bill-cards';
            const params = new URLSearchParams();
            
            if (subInventory) {
                params.append('data', subInventory);
            }
            params.append('year', queryYear);
            
            const url = `${baseUrl}?${params.toString()}`;
            const response = await axios.get(url);

            const billCardsData = response.data.bill_cards || [];
            
            const mappedData = billCardsData.map(item => ({
                M_PART_NUMBER: item.m_part_number || '',
                M_PART_DESCRIPTION: item.m_part_description || '',
                M_SUBINV: item.m_subinv || '',
                M_DATE: item.m_date_begin || '', // Updated field name
                M_QTY: item.begin_qty || '0',    // Updated field name
                M_QTY_RM: item.begin_qty || '0', // Use the same begin_qty for remaining
                M_ID: item.m_id || '',
                M_SOURCE_ID: item.m_source_id || '',
                M_SOURCE_NAME: item.m_source_name || '',
                M_SOURCE_LINE_ID: item.m_source_line_id || '',
                M_TYPE_ID: item.m_type_id || '',
                TRANSACTION_TYPE_NAME: item.m_type_name || '',
                M_USER_NAME: item.created_by_user || '', // Updated field name
                M_PART_IMG: item.m_part_number ? `/images/${item.m_part_number}.png` : '',
                INVENTORY_ITEM_ID: item.inventory_item_id || '', // New field
                BEGIN_QTY: item.begin_qty || '0',               // New field
                CURRENT_QTY: item.begin_qty || '0'              // New field for current quantity
            }));

            billCardsCache.set(cacheKey, mappedData);
            return mappedData;
        } catch (error) {
            console.error('Error fetching bill cards:', error);
            throw error;
        } finally {
            isFetching = false;
        }
    },

    clearCache: (subInventory = null, year = null) => {
        if (subInventory && year) {
            const cacheKey = `${subInventory}-${year}`;
            billCardsCache.delete(cacheKey);
        } else if (subInventory) {
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