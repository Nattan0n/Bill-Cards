// src/services/directAccessService.js
import axios from 'axios';

// สร้าง instance สำหรับเรียก API โดยตรงเหมือนเว็บ
const directApi = axios.create({
  baseURL: 'http://129.200.6.52/laravel_oracle_api/public',
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
    'Accept': 'application/json; charset=UTF-8'
  },
  timeout: 8000
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

// เพิ่มการจัดการ encoding สำหรับข้อมูลภาษาไทย
directApi.interceptors.request.use(
  config => {
    // แปลงค่าพารามิเตอร์ที่เป็นภาษาไทยให้เข้ารหัสถูกต้อง
    if (config.params) {
      Object.keys(config.params).forEach(key => {
        const value = config.params[key];
        if (typeof value === 'string' && /[\u0E00-\u0E7F]/.test(value)) {
          // ถ้ามีตัวอักษรไทย ให้ตรวจสอบว่าจำเป็นต้องเข้ารหัสหรือไม่
          try {
            // เปรียบเทียบค่าดั้งเดิมกับค่าที่ encode แล้ว decode กลับมา
            const encoded = encodeURIComponent(value);
            const decoded = decodeURIComponent(encoded);
            
            if (decoded !== value) {
              console.log(`Parameter ${key} needs encoding:`, value);
              config.params[key] = encoded;
            }
          } catch (e) {
            console.error(`Error encoding param ${key}:`, e);
          }
        }
      });
    }
    return config;
  },
  error => Promise.reject(error)
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
      
      // ถ้าไม่มี itemId หรือ subInventory ให้ return ข้อมูลว่าง
      if (!itemId || !subInventory) {
        console.warn("Missing itemId or subInventory");
        return [];
      }
      
      // ตรวจสอบและแปลงค่าภาษาไทยใน subInventory ถ้าจำเป็น
      let encodedSubInventory = subInventory;
      if (/[\u0E00-\u0E7F]/.test(subInventory)) {
        console.log("Thai characters detected in subInventory, encoding...");
        encodedSubInventory = encodeURIComponent(subInventory);
      }
      
      // ตรวจสอบและแปลงค่า itemId หากเป็น JSON หรือมีภาษาไทย
      let encodedItemId = itemId;
      if (typeof itemId === 'string') {
        const isComplexData = itemId.includes('{') || /[\u0E00-\u0E7F]/.test(itemId);
        if (isComplexData) {
          // ถ้าเป็น JSON หรือมีภาษาไทย ให้ถอดออกและใช้เฉพาะ partNumber
          try {
            // ถ้าเป็น JSON string ลองแยก partNumber ออกมา
            if (itemId.includes('{') && itemId.includes('}')) {
              const match = itemId.match(/"partNumber"\s*:\s*"([^"]+)"/);
              if (match && match[1]) {
                encodedItemId = match[1];
                console.log("Extracted partNumber from JSON:", encodedItemId);
              }
            }
          } catch (parseError) {
            console.error("Error extracting partNumber:", parseError);
          }
        }
        
        // เข้ารหัส URL สำหรับการส่งไป API
        encodedItemId = encodeURIComponent(encodedItemId);
      }
      
      const response = await directApi.get('/api/oracle/bill-cards', {
        params: {
          data: encodedSubInventory,
          id: encodedItemId
        }
      });
      
      console.log("Direct API bill cards response:", response.data);
      return this.mapBillCardsData(response.data?.bill_cards || []);
    } catch (error) {
      console.error("Error fetching bill cards:", error);
      
      // สร้างข้อมูลสำรองเพื่อให้ UI แสดงได้แม้ API มีปัญหา
      if (error.response?.status === 500 || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        console.log("Creating fallback data for UI display");
        return [{
          M_PART_NUMBER: itemId,
          M_PART_DESCRIPTION: `ข้อมูลออฟไลน์ - ${itemId || "ไม่ระบุ"}`,
          M_SUBINV: subInventory,
          M_DATE: new Date().toISOString(),
          M_QTY: "0",
          begin_qty: "0",
          TRANSACTION_TYPE_NAME: "OFFLINE MODE",
          M_USER_NAME: "-",
          M_SOURCE_REFERENCE: "-",
          inventory_item_id: typeof itemId === 'string' && itemId.includes('inventory_item_id') ? 
            itemId.match(/"inventory_item_id"\s*:\s*"([^"]+)"/)?.[ 1] || "" : "",
          _isOfflineData: true,
          _errorType: error.code || error.response?.status,
          _errorMessage: error.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้"
        }];
      }
      
      return [];
    }
  },

  // แปลงรูปแบบข้อมูลให้ตรงกับที่ app ใช้งาน
  mapBillCardsData(billCards) {
    if (!Array.isArray(billCards) || billCards.length === 0) {
      return [];
    }
    
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
      inventory_item_id: item.inv_item_id || item.inventory_item_id || "",
    }));
  },
  
  // เพิ่มฟังก์ชัน retry เพื่อลองเชื่อมต่อหลายครั้ง
  async fetchWithRetry(apiCall, retries = 2, delay = 1000) {
    try {
      return await apiCall();
    } catch (error) {
      if (retries <= 0) throw error;
      
      console.log(`Retrying... Attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.fetchWithRetry(apiCall, retries - 1, delay * 1.5);
    }
  }
};