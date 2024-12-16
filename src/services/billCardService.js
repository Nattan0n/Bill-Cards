// services/billCardService.js
import axios from '../utils/axios';

// สร้างตัวแปร cache ไว้เก็บข้อมูล
let billCardsCache = null;
let isFetching = false;

export const billCardService = {
    getBillCards: async () => {
        // ถ้ามีข้อมูลใน cache แล้ว ให้ return ข้อมูลจาก cache
        if (billCardsCache) {
            console.log("Returning data from cache:", billCardsCache); // log ข้อมูลจาก cache
            return billCardsCache;
        }

        // ป้องกันการเรียก API ซ้ำซ้อน
        if (isFetching) {
            // รอจนกว่าการ fetch ก่อนหน้าจะเสร็จ
            console.log("Waiting for previous fetch to complete..."); // log เมื่อรอ fetch ก่อนหน้า
            while (isFetching) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            console.log("Returning cached data after fetch completes.");
            return billCardsCache;
        }

        try {
            isFetching = true;
            console.log("Fetching data from API..."); // log ก่อนการ fetch API
            const response = await axios.get('/api/oracle/bill-cards');
            console.log("API response:", response); // log ข้อมูลที่ได้รับจาก API

            const billCardsData = response.data.bill_cards || [];
            console.log("Mapped bill cards data:", billCardsData); // log ข้อมูลที่ได้จาก API หลังการ map

            // แมป data เหมือนเดิม
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
                M_PART_IMG: item.m_part_img || 'https://placehold.co/600x400'
            }));

            console.log("Mapped data:", mappedData); // log ข้อมูลหลังการแมป

            // เก็บข้อมูลลง cache
            billCardsCache = mappedData;
            console.log("Data saved to cache:", billCardsCache); // log ข้อมูลที่เก็บลงใน cache
            return mappedData;
        } catch (error) {
            console.error('Error fetching bill cards:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw error;
        } finally {
            isFetching = false;
            console.log("Fetching complete."); // log เมื่อการ fetch เสร็จสิ้น
        }
    },

    // เพิ่มเมธอดสำหรับ clear cache (ใช้เมื่อต้องการโหลดข้อมูลใหม่)
    clearCache: () => {
        billCardsCache = null;
        console.log("Cache cleared."); // log เมื่อ cache ถูกลบ
    }
};

// เพิ่ม event listener สำหรับ beforeunload เพื่อ clear cache เมื่อ refresh หน้า
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        billCardsCache = null;
    });
}