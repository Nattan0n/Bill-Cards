// services/billCardService.js
import axios from '../utils/axios';

export const billCardService = {
    // ดึงข้อมูลแบบแบ่งหน้า
    getBillCardsPage: async (subInventory, page = 1, year = null) => {
        try {
            const params = new URLSearchParams();
            if (subInventory) {
                params.append('data', subInventory);
            }
            if (year) {
                params.append('year', year);
            }
            params.append('page', page);

            const response = await axios.get(`/api/oracle/bill-cards?${params.toString()}`);
            
            // แปลงข้อมูลให้ตรงตาม format ที่ต้องการ
            const billCardsData = response.data.bill_cards.map(item => ({
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

            return {
                data: billCardsData,
                pagination: {
                    currentPage: response.data.current_page,
                    lastPage: response.data.last_page,
                    totalCount: response.data.total_count,
                    perPage: response.data.per_page
                }
            };
        } catch (error) {
            console.error('Error fetching bill cards:', error);
            throw error;
        }
    },

    // ดึงข้อมูลยอดคงเหลือของ part
    getPartBalance: async (partNumber, subInventory) => {
        try {
            const params = new URLSearchParams({
                part_number: partNumber,
                subinventory: subInventory
            });

            const response = await axios.get(`/api/oracle/part-balance?${params.toString()}`);
            return response.data.balance;
        } catch (error) {
            console.error('Error fetching part balance:', error);
            throw error;
        }
    },

    // ดึงข้อมูล summary ของ subinventory
    getSubinventorySummary: async (subInventory, year = null) => {
        try {
            const params = new URLSearchParams({
                subinventory: subInventory
            });
            if (year) {
                params.append('year', year);
            }

            const response = await axios.get(`/api/oracle/subinventory-summary?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching subinventory summary:', error);
            throw error;
        }
    }
};