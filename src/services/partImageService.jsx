// services/partImageService.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { imageApi } from '../utils/axios';

const BASE_URL = 'http://129.200.6.50:83';
const DEFAULT_IMAGE = 'No_Image_Available.jpg';

// สร้าง cache สำหรับเก็บข้อมูลรูปภาพ
const imageCache = new Map();
let imagesData = null;
let loadingPromise = null;

// Function สำหรับโหลดข้อมูลรูปภาพทั้งหมดครั้งเดียว
const loadAllImages = async () => {
    if (imagesData) return imagesData;
    if (loadingPromise) return loadingPromise;

    loadingPromise = imageApi.get('/api/images')
        .then(response => {
            imagesData = new Map(
                response.data.map(img => [img.partNumber, img.imagePath])
            );
            return imagesData;
        })
        .catch(error => {
            console.error('Error loading images:', error);
            return new Map();
        })
        .finally(() => {
            loadingPromise = null;
        });

    return loadingPromise;
};

const PartImage = React.memo(({ partNumber, width = 'w-24', height = 'h-24', className = '' }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ใช้ useMemo เพื่อป้องกันการ re-render ที่ไม่จำเป็น
    const defaultImageUrl = useMemo(() => `${BASE_URL}/storage/images/${DEFAULT_IMAGE}`, []);

    useEffect(() => {
        let mounted = true;

        const getImage = async () => {
            if (!partNumber) {
                setError('ไม่มีรหัสชิ้นส่วน');
                setImageUrl(defaultImageUrl);
                setLoading(false);
                return;
            }

            // ตรวจสอบ cache ก่อน
            if (imageCache.has(partNumber)) {
                setImageUrl(imageCache.get(partNumber));
                setLoading(false);
                return;
            }

            try {
                const imagesMap = await loadAllImages();
                
                if (!mounted) return;

                if (imagesMap.has(partNumber)) {
                    const url = imagesMap.get(partNumber);
                    imageCache.set(partNumber, url);
                    setImageUrl(url);
                    setError(null);
                } else {
                    setImageUrl(defaultImageUrl);
                    setError('ไม่พบรูปภาพ');
                }
            } catch (err) {
                if (mounted) {
                    setImageUrl(defaultImageUrl);
                    setError('ไม่พบรูปภาพ');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        getImage();

        return () => {
            mounted = false;
        };
    }, [partNumber, defaultImageUrl]);

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
                src={imageUrl}
                alt={`Part ${partNumber}`}
                className="w-full h-full object-fill"
                loading="lazy"
                onError={(e) => {
                    if (!e.target.src.includes(DEFAULT_IMAGE)) {
                        e.target.src = defaultImageUrl;
                    }
                }}
            />
        </div>
    );
});

PartImage.displayName = 'PartImage';

export { PartImage };