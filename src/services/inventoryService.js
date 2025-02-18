import axios from 'axios';
import _ from 'lodash';

// สร้าง axios instance
const api = axios.create({
  baseURL: 'http://129.200.6.52/laravel_oracle_api/public',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000
});

// เพิ่ม interceptor สำหรับจัดการ rate limiting
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 429) {
      // รอ 2 วินาทีก่อน retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(error.config);
    }
    return Promise.reject(error);
  }
);

// Cache settings
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

const fetchWithCache = async (key, fetchFn) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  return data;
};

// Transform bill cards to match existing structure
const transformBillCards = (billCards) => {
  return billCards.map(card => ({
    inv_item_id: card.inv_item_id,
    M_PART_NUMBER: card.m_part_number || '',
    M_PART_DESCRIPTION: card.m_part_description || '',
    M_SUBINV: card.m_subinv || '',
    M_DATE: card.m_date || '',
    M_QTY: card.m_qty || '0',
    begin_qty: card.begin_qty || '0',
    M_ID: card.m_id || '',
    M_SOURCE_ID: card.m_source_id || '',
    M_SOURCE_NAME: card.m_source_name || '',
    M_SOURCE_LINE_ID: card.m_source_line_id || '',
    M_TYPE_ID: card.m_type_id || '',
    TRANSACTION_TYPE_NAME: card.m_type_name || '',
    M_USER_NAME: card.user_name || '-',
    m_date_begin: card.m_date_begin || ''
  }));
};

// Fetch inventory items
const fetchInventories = async () => {
  const cacheKey = 'inventories';
  
  try {
    return await fetchWithCache(cacheKey, async () => {
      const response = await api.get('/api/oracle/inventorys');
      const items = response.data?.inventorys || [];
      
      // Group by secondary_inventory
      return _.chain(items)
        .groupBy('secondary_inventory')
        .map((items, key) => ({
          secondary_inventory: key,
          description: items[0]?.description || '',
          inventory_items: items.map(item => ({
            inventory_item_id: item.inventory_item_id,
            part_number: item.part_number,
            part_description: item.part_description
          }))
        }))
        .value();
    });
  } catch (error) {
    console.error('Error fetching inventories:', error);
    throw new Error('Failed to load inventories');
  }
};

// Fetch bill cards for specific inventory item
const fetchBillCards = async (subInventory, inventoryItemId) => {
  const cacheKey = `billcards-${subInventory}-${inventoryItemId}`;
  
  try {
    return await fetchWithCache(cacheKey, async () => {
      const response = await api.get('/api/oracle/bill-cards', {
        params: {
          data: subInventory,
          id: inventoryItemId
        }
      });

      const billCards = response.data?.bill_cards || [];
      
      // Transform bill cards to match existing structure
      return transformBillCards(billCards);
    });
  } catch (error) {
    console.error('Error fetching bill cards:', error);
    return []; // Return empty array on error
  }
};

// Process bill cards with running total
const processBillCards = (billCards) => {
  if (!Array.isArray(billCards)) return [];

  // Sort by date and ID
  const sortedBills = _.orderBy(billCards, [
    bill => {
      const date = new Date(bill.M_DATE);
      return date ? date.getTime() : 0;
    },
    'M_ID'
  ], ['desc', 'desc']);

  // Calculate running total
  let runningTotal = 0;
  return sortedBills.map(bill => {
    const qty = Number(bill.M_QTY || 0);
    runningTotal += qty;
    return {
      ...bill,
      totalQty: runningTotal
    };
  });
};

const clearCache = () => {
  cache.clear();
};

export const inventoryService = {
  fetchInventories,
  fetchBillCards,
  processBillCards,
  clearCache
};