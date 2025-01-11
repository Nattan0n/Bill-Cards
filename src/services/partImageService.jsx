import React, { useState, useEffect, useMemo } from 'react';
import { imageApi } from '../utils/axios';

const BASE_URL = 'http://129.200.6.50:83';
const DEFAULT_IMAGE = 'No_Image_Available.jpg';
const IMAGE_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

class ImageCache {
    constructor() {
        this.cache = new Map();
        this.timeouts = new Map();
        this.fetchPromises = new Map();
    }

    set(key, value) {
        if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key));
        }

        this.cache.set(key, value);
        this.timeouts.set(key, setTimeout(() => {
            this.cache.delete(key);
            this.timeouts.delete(key);
        }, IMAGE_CACHE_DURATION));
    }

    get(key) {
        return this.cache.get(key);
    }

    has(key) {
        return this.cache.has(key);
    }

    setPendingPromise(key, promise) {
        this.fetchPromises.set(key, promise);
    }

    getPendingPromise(key) {
        return this.fetchPromises.get(key);
    }

    clearPendingPromise(key) {
        this.fetchPromises.delete(key);
    }
}

const imageCache = new ImageCache();
let imagesDataPromise = null;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const loadAllImages = async (retryCount = 0) => {
    if (imagesDataPromise) {
        return imagesDataPromise;
    }

    try {
        imagesDataPromise = imageApi.get('/api/images')
            .then(response => {
                return new Map(
                    response.data.map(img => [img.partNumber, img.imagePath])
                );
            });
        
        return await imagesDataPromise;
    } catch (error) {
        if (retryCount < RETRY_ATTEMPTS) {
            await sleep(RETRY_DELAY * (retryCount + 1));
            return loadAllImages(retryCount + 1);
        }
        console.error('Error loading images after retries:', error);
        return new Map();
    } finally {
        if (retryCount === RETRY_ATTEMPTS) {
            imagesDataPromise = null;
        }
    }
};

const PartImage = React.memo(({ 
    partNumber, 
    width = 'w-24', 
    height = 'h-24', 
    className = '',
    onLoad,
    onError 
}) => {
    const [imageState, setImageState] = useState({
        url: null,
        loading: true,
        error: null
    });

    const defaultImageUrl = useMemo(() => 
        `${BASE_URL}/storage/images/${DEFAULT_IMAGE}`, 
        []
    );

    useEffect(() => {
        let mounted = true;

        const getImage = async () => {
            if (!partNumber) {
                setImageState({
                    url: defaultImageUrl,
                    loading: false,
                    error: 'ไม่มีรหัสชิ้นส่วน'
                });
                return;
            }

            // ตรวจสอบ cache
            if (imageCache.has(partNumber)) {
                setImageState({
                    url: imageCache.get(partNumber),
                    loading: false,
                    error: null
                });
                return;
            }

            // ตรวจสอบว่ามี pending promise หรือไม่
            let pendingPromise = imageCache.getPendingPromise(partNumber);
            if (!pendingPromise) {
                pendingPromise = loadAllImages();
                imageCache.setPendingPromise(partNumber, pendingPromise);
            }

            try {
                const imagesMap = await pendingPromise;
                
                if (!mounted) return;

                if (imagesMap.has(partNumber)) {
                    const url = imagesMap.get(partNumber);
                    imageCache.set(partNumber, url);
                    setImageState({
                        url,
                        loading: false,
                        error: null
                    });
                    onLoad?.();
                } else {
                    setImageState({
                        url: defaultImageUrl,
                        loading: false,
                        error: 'ไม่พบรูปภาพ'
                    });
                    onError?.('Image not found');
                }
            } catch (err) {
                if (mounted) {
                    setImageState({
                        url: defaultImageUrl,
                        loading: false,
                        error: 'ไม่พบรูปภาพ'
                    });
                    onError?.(err);
                }
            } finally {
                imageCache.clearPendingPromise(partNumber);
            }
        };

        getImage();

        return () => {
            mounted = false;
        };
    }, [partNumber, defaultImageUrl, onLoad, onError]);

    const { url, loading, error } = imageState;

    if (loading) {
        return (
            <div className={`${width} ${height} flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className={`${width} ${height} overflow-hidden rounded-lg ${className} flex items-center justify-center bg-gray-50`}>
            <img
                src={url}
                alt={`Part ${partNumber}`}
                className="w-full h-full object-fill"
                loading="lazy"
                onError={(e) => {
                    if (!e.target.src.includes(DEFAULT_IMAGE)) {
                        e.target.src = defaultImageUrl;
                        onError?.('Image load failed');
                    }
                }}
                onLoad={() => onLoad?.()}
            />
        </div>
    );
});

PartImage.displayName = 'PartImage';

export { PartImage };