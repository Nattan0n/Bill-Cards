// 2. services/billCardService.js
import axios from '../utils/axios';

let billCardsCache = null;
let isFetching = false;

export const billCardService = {
    getBillCards: async () => {
        if (billCardsCache) {
            console.log("Returning data from cache:", billCardsCache);
            return billCardsCache;
        }

        if (isFetching) {
            console.log("Waiting for previous fetch to complete...");
            while (isFetching) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return billCardsCache;
        }

        try {
            isFetching = true;
            console.log("Fetching data from API...");
            const response = await axios.get('/api/oracle/bill-cards');

            const billCardsData = response.data.bill_cards || [];
            console.log("Raw bill cards data:", billCardsData);

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
                // ใช้ part number เป็นชื่อไฟล์รูป
                M_PART_IMG: item.m_part_number ? `/images/${item.m_part_number}.png` : ''
            }));

            billCardsCache = mappedData;
            console.log("Mapped and cached data:", mappedData);
            return mappedData;
        } catch (error) {
            console.error('Error fetching bill cards:', error);
            throw error;
        } finally {
            isFetching = false;
        }
    },

    clearCache: () => {
        billCardsCache = null;
        console.log("Cache cleared.");
    }
};