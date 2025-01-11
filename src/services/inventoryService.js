// services/inventoryService.js
import axios from '../utils/axios';

let inventoriesCache = null;

export const inventoryService = {
    getInventories: async () => {
        if (inventoriesCache) {
            return inventoriesCache;
        }

        try {
            const response = await axios.get('/api/oracle/inventorys');
            const inventories = response.data.inventorys?.map(inv => ({
                name: inv.secondary_inventory_name,
                description: inv.description,
                disableDate: inv.disable_date
            })) || [];
            
            // Sort inventories with GP-DAIK first
            const sortedInventories = inventories.sort((a, b) => {
                if (a.name === "GP-DAIK") return -1;
                if (b.name === "GP-DAIK") return 1;
                return a.name.localeCompare(b.name);
            });

            inventoriesCache = sortedInventories;
            return sortedInventories;
        } catch (error) {
            console.error('Error fetching inventories:', error);
            throw error;
        }
    },

    clearCache: () => {
        inventoriesCache = null;
    }
};