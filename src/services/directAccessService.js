// src/services/directAccessService.js
import axios from 'axios';

// สร้าง instance สำหรับเรียก API โดยตรงเหมือนเว็บ
const directApi = axios.create({
  baseURL: 'http://129.200.6.52/laravel_oracle_api/public',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

// บันทึกข้อผิดพลาดละเอียดกว่าเดิม
directApi.interceptors.response.use(
  response => response,
  error => {
    // บันทึกรายละเอียดข้อผิดพลาด
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      params: error.config?.params,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const directAccessService = {
  // เรียกข้อมูล Inventory Items แบบเดียวกับเว็บ
  async getInventoryItems() {
    try {
      const response = await directApi.get('/api/oracle/inventorys');
      console.log("Direct API inventory response:", response.data);
      return response.data?.inventorys || [];
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      return [];
    }
  },

  // เรียกข้อมูล Bill Cards แบบเดียวกับเว็บ
  async getBillCards(subInventory, itemId) {
    try {
      console.log(`Fetching bill cards directly using: data=${subInventory}, id=${itemId}`);
      const response = await directApi.get('/api/oracle/bill-cards', {
        params: {
          data: subInventory,
          id: itemId
        }
      });
      
      console.log("Direct API bill cards response:", response.data);
      return this.mapBillCardsData(response.data?.bill_cards || []);
    } catch (error) {
      console.error("Error fetching bill cards:", error);
      
      // สร้างข้อมูลสำรองเพื่อให้ UI แสดงได้แม้ API มีปัญหา
      if (error.response?.status === 500) {
        console.log("Creating fallback data for UI display");
        return [{
          M_PART_NUMBER: itemId,
          M_PART_DESCRIPTION: "ไม่สามารถเชื่อมต่อกับ API ได้",
          M_SUBINV: subInventory,
          M_DATE: new Date().toISOString(),
          M_QTY: "0",
          TRANSACTION_TYPE_NAME: "ERROR",
          inventory_item_id: itemId,
          _isOfflineData: true
        }];
      }
      
      return [];
    }
  },

  // แปลงรูปแบบข้อมูลให้ตรงกับที่ app ใช้งาน
  mapBillCardsData(billCards) {
    return billCards.map(item => ({
      M_PART_NUMBER: item.m_part_number || "",
      M_PART_DESCRIPTION: item.m_part_description || "",
      M_SUBINV: item.m_subinv || "",
      M_DATE: item.m_date || "",
      M_QTY: item.m_qty || "0",
      begin_qty: item.begin_qty || "0",
      M_ID: item.m_id || "",
      M_SOURCE_ID: item.m_source_id || "",
      M_SOURCE_NAME: item.m_source_name || "",
      M_SOURCE_LINE_ID: item.m_source_line_id || "",
      M_TYPE_ID: item.m_type_id || "",
      TRANSACTION_TYPE_NAME: item.m_type_name || "",
      M_USER_NAME: item.user_name || "-",
      M_SOURCE_REFERENCE: item.source_reference || "-",
      m_date_begin: item.m_date_begin || "",
      inventory_item_id: item.inv_item_id || "",
    }));
  }
};