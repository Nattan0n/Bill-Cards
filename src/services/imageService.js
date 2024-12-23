import { imageApi } from '../utils/axios';

const imageCache = new Map();

export const imageService = {
    async getImage(filename) {
        try {
            // เปลี่ยนเป็น URL ของ server ที่ถูกต้อง
            const response = await fetch(`http://129.200.6.50:83/storage/images/${filename}`, {
                method: 'GET',
                headers: {
                    'Accept': 'image/*'
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            imageCache.set(filename, url);
    
            return url;
        } catch (error) {
            console.error('Failed to load image:', error);
            throw error;
        }
    },

    clearCache() {
        imageCache.forEach(url => URL.revokeObjectURL(url));
        imageCache.clear();
    }
};