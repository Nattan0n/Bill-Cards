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
  }

  async getBillCards(subInventory = null, itemId = null, { signal } = {}) {
    // ถ้าไม่มี subInventory หรือ itemId ให้ return empty array
    if (!subInventory || !itemId) return [];

    const cacheKey = `${subInventory}-${itemId}`;

    // Check valid cache
    if (this.cache.has(cacheKey)) {
      const expirationTime = this.cacheExpiration.get(cacheKey);
      if (expirationTime > Date.now()) {
        return this.cache.get(cacheKey);
      }
      this.clearSpecificCache(cacheKey);
    }

    // Return existing pending request
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const requestPromise = this.fetchWithRetry(cacheKey, subInventory, itemId, signal);
    this.pendingRequests.set(cacheKey, requestPromise);

    return requestPromise;
  }

  async fetchWithRetry(cacheKey, subInventory, itemId, signal, attempt = 1) {
    try {
      const data = await this.fetchBillCards(subInventory, itemId, signal);
      this.updateCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < this.retryAttempts) {
        await new Promise((resolve) => 
          setTimeout(resolve, this.retryDelay * attempt)
        );
        return this.fetchWithRetry(cacheKey, subInventory, itemId, signal, attempt + 1);
      }
      
      return []; // Return empty array on final failure
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  async fetchBillCards(subInventory, itemId, signal) {
    try {
      const response = await oracleApi.get('/api/oracle/bill-cards', {
        params: { 
          data: subInventory,
          id: itemId 
        },
        signal
      });
      
      const billCardsData = response.data?.bill_cards || [];
      return this.mapBillCardsData(billCardsData);
    } catch (error) {
      console.error('Error fetching bill cards:', error);
      throw error; // Re-throw to be caught by fetchWithRetry
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

export const billCardService = new BillCardService();
export default BillCardService;