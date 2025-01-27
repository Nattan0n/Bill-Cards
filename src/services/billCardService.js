// billCardService.js
import oracleApi from '../utils/axios';

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

    async getBillCards(subInventory = null, year = null) {
        const queryYear = year || new Date().getFullYear();
        const cacheKey = `${subInventory || 'all'}-${queryYear}`;
        
        // Check valid cache
        if (this.cache.has(cacheKey)) {
            const expirationTime = this.cacheExpiration.get(cacheKey);
            if (expirationTime > Date.now()) {
                return this.cache.get(cacheKey);
            }
            // Clear expired cache
            this.clearSpecificCache(cacheKey);
        }

        // Return existing pending request
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        const requestPromise = this.fetchWithRetry(cacheKey, subInventory, queryYear);
        this.pendingRequests.set(cacheKey, requestPromise);
        
        return requestPromise;
    }

    async fetchWithRetry(cacheKey, subInventory, queryYear, attempt = 1) {
        try {
            const data = await this.fetchBillCards(subInventory, queryYear);
            this.updateCache(cacheKey, data);
            return data;
        } catch (error) {
            if (attempt < this.retryAttempts) {
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                return this.fetchWithRetry(cacheKey, subInventory, queryYear, attempt + 1);
            }
            throw error;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    async fetchBillCards(subInventory, queryYear) {
        this.isFetching = true;
        try {
            const baseUrl = '/api/oracle/bill-cards';
            const params = new URLSearchParams();
            
            if (subInventory) {
                params.append('data', subInventory);
            }
            params.append('year', queryYear);
            
            const response = await oracleApi.get(`${baseUrl}?${params.toString()}`);
            const billCardsData = response.data.bill_cards || [];
            const mappedData = this.mapBillCardsData(billCardsData);
            return this.sortBillCardsByDate(mappedData);
        } finally {
            this.isFetching = false;
        }
    }

    updateCache(cacheKey, data) {
        this.cache.set(cacheKey, data);
        this.cacheExpiration.set(cacheKey, Date.now() + this.CACHE_DURATION);
    }

    clearSpecificCache(cacheKey) {
        this.cache.delete(cacheKey);
        this.cacheExpiration.delete(cacheKey);
    }

    mapBillCardsData(billCardsData) {
        return billCardsData.map(item => ({
            M_PART_NUMBER: item.m_part_number || '',
            M_PART_DESCRIPTION: item.m_part_description || '',
            M_SUBINV: item.m_subinv || '',
            M_DATE: item.m_date || '',
            M_QTY: item.m_qty || '0',
            begin_qty: item.begin_qty || '0',
            M_ID: item.m_id || '',
            M_SOURCE_ID: item.m_source_id || '',
            M_SOURCE_NAME: item.m_source_name || '',
            M_SOURCE_LINE_ID: item.m_source_line_id || '',
            M_TYPE_ID: item.m_type_id || '',
            TRANSACTION_TYPE_NAME: item.m_type_name || '',
            M_USER_NAME: item.user_name|| '-',
            // M_USER_NAME: item.created_by_user || '-',
            // Optimize image loading
            M_PART_IMG: null, // Lazy load images
            partNumber: item.m_part_number // Store for lazy loading
        }));
    }

    sortBillCardsByDate(data) {
        return data.sort((a, b) => {
            const dateA = new Date(a.M_DATE);
            const dateB = new Date(b.M_DATE);
            return dateB - dateA; // Sort descending for better UX
        });
    }

    clearCache(subInventory = null, year = null) {
        if (subInventory && year) {
            this.clearSpecificCache(`${subInventory}-${year}`);
        } else if (subInventory) {
            for (const key of this.cache.keys()) {
                if (key.startsWith(`${subInventory}-`)) {
                    this.clearSpecificCache(key);
                }
            }
        } else {
            this.cache.clear();
            this.cacheExpiration.clear();
        }
    }
}

export const billCardService = new BillCardService();