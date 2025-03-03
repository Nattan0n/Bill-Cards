import oracleApi from "../utils/axios";

class BillCardService {
  constructor() {
    this.cache = new Map();
    this.isFetching = false;
    this.pendingRequests = new Map();
    this.cacheExpiration = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.logLevel = 'minimal'; // 'verbose', 'normal', 'minimal'
  }

  // เพิ่มฟังก์ชันสำหรับตั้งค่าระดับการแสดง log
  setLogLevel(level) {
    if (['verbose', 'normal', 'minimal'].includes(level)) {
      this.logLevel = level;
    }
  }
  
  // ปรับปรุงฟังก์ชันการ log
  log(level, ...args) {
    const levelMap = {
      'error': 0,
      'warn': 1,
      'info': 2,
      'debug': 3
    };
    
    const logLevelMap = {
      'minimal': 0, // แสดงแค่ error เท่านั้น
      'normal': 2,  // แสดงถึง info
      'verbose': 3  // แสดงทั้งหมด
    };
    
    if (levelMap[level] <= logLevelMap[this.logLevel]) {
      if (level === 'error') {
        console.error(...args);
      } else if (level === 'warn') {
        console.warn(...args);
      } else if (level === 'info') {
        console.log(...args);
      } else if (level === 'debug') {
        console.debug(...args);
      }
    }
  }

  async getBillCards(subInventory = null, itemId = null, { signal } = {}) {
    // ถ้าไม่มี subInventory หรือ itemId ให้ return empty array
    if (!subInventory || !itemId) return [];

    const cacheKey = `${subInventory}-${itemId}`;

    // Check valid cache
    if (this.cache.has(cacheKey)) {
      const expirationTime = this.cacheExpiration.get(cacheKey);
      if (expirationTime > Date.now()) {
        this.log('info', `Using cached data for ${cacheKey}`);
        return this.cache.get(cacheKey);
      }
      this.clearSpecificCache(cacheKey);
    }

    // Return existing pending request
    if (this.pendingRequests.has(cacheKey)) {
      this.log('info', `Using pending request for ${cacheKey}`);
      return this.pendingRequests.get(cacheKey);
    }

    const requestPromise = this.fetchWithRetry(cacheKey, subInventory, itemId, signal);
    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  async fetchWithRetry(cacheKey, subInventory, itemId, signal, attempt = 1) {
    const MAX_ATTEMPTS = 3;
    try {
      const data = await this.fetchBillCards(subInventory, itemId, signal);
      
      if (data.length === 0 && attempt < MAX_ATTEMPTS) {
        this.log('info', `Attempt ${attempt} returned no data, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.fetchWithRetry(cacheKey, subInventory, itemId, signal, attempt + 1);
      }
      
      this.updateCache(cacheKey, data);
      return data;
    } catch (error) {
      if (attempt < MAX_ATTEMPTS) {
        this.log('info', `Attempt ${attempt} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.fetchWithRetry(cacheKey, subInventory, itemId, signal, attempt + 1);
      }
      
      // สร้างข้อมูลจำลองเมื่อเกิด error
      this.log('warn', `All ${MAX_ATTEMPTS} attempts failed, using fallback data`);
      
      // สร้างข้อมูลจำลองสำหรับแสดงใน UI
      const fallbackData = [{
        M_PART_NUMBER: itemId,
        M_PART_DESCRIPTION: `ข้อมูลออฟไลน์ - ${itemId || "ไม่ระบุ"}`,
        M_SUBINV: subInventory,
        M_DATE: new Date().toISOString(),
        M_QTY: "0",
        begin_qty: "0",
        TRANSACTION_TYPE_NAME: "OFFLINE MODE",
        M_USER_NAME: "-",
        M_SOURCE_REFERENCE: "-",
        inventory_item_id: itemId,
        _isOfflineData: true,
        _errorType: error?.code || error?.response?.status || 'UNKNOWN',
        _errorMessage: error?.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้"
      }];
      
      // บันทึกข้อมูลจำลองเข้า cache
      this.updateCache(cacheKey, fallbackData);
      
      return fallbackData;
    }
  }

  async fetchBillCards(subInventory, itemId, signal) {
    try {
      // ใช้ encodeURIComponent เพื่อป้องกันปัญหา URL encoding
      const encodedItemId = encodeURIComponent(itemId);
      
      this.log('info', `Fetching bill cards for ${subInventory}, item ID: ${itemId}`);
      
      const response = await oracleApi.get('/api/oracle/bill-cards', {
        params: { 
          data: subInventory,
          id: encodedItemId 
        },
        signal,
      });
      
      this.log('info', 'Full API Response:', {
        billCardsCount: response.data?.bill_cards?.length,
        totalCount: response.data?.total_count
      });
      
      return this.mapBillCardsData(response.data?.bill_cards || []);
    } catch (error) {
      // ลดขนาดของข้อมูล error ที่บันทึก
      this.log('error', 'Bill Cards Fetch Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message
      });
      throw error;
    }
  }

  mapBillCardsData(billCardsData) {
    return billCardsData.map((item) => ({
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
      inventory_item_id: item.inventory_item_id || "",
    }));
  }

  updateCache(cacheKey, data) {
    this.cache.set(cacheKey, data);
    this.cacheExpiration.set(cacheKey, Date.now() + this.CACHE_DURATION);
    this.pendingRequests.delete(cacheKey);
  }

  clearSpecificCache(cacheKey) {
    this.cache.delete(cacheKey);
    this.cacheExpiration.delete(cacheKey);
  }

  clearCache(subInventory = null, itemId = null) {
    if (subInventory) {
      const cacheKey = `${subInventory}${itemId ? `-${itemId}` : ''}`;
      this.clearSpecificCache(cacheKey);
    } else {
      this.cache.clear();
      this.cacheExpiration.clear();
    }
  }
}

// สร้าง instance และตั้งค่าระดับการแสดง log เป็น minimal
export const billCardService = new BillCardService();
billCardService.setLogLevel('minimal'); // ปรับเป็น 'verbose' เมื่อต้องการ debug
export default BillCardService;