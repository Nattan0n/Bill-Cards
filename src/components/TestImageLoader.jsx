import React, { useState, useEffect } from 'react';
import { imageService } from '../services/imageService';

const TestImageLoader = () => {
    const [imageUrl, setImageUrl] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // ใช้ชื่อไฟล์จริง
    const imageName = 'KMks9OZEMYhO7Xilev6uykB48gRW1DvrntbEPx1M.png';

    const loadImage = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const url = await imageService.getImage(imageName);
            setImageUrl(url);
        } catch (err) {
            console.error('Error loading image:', err);
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);


    return (
        <div className="p-4">
            <div className="mb-2">
                <p className="text-sm text-gray-600">Testing image: {imageName}</p>
            </div>

            <img 
                src={`http://129.200.6.50:83/storage/images/${imageName}`}
                alt="Test" 
                className="max-w-xs border rounded shadow-sm"
                onError={(e) => {
                    console.error('Image display error');
                    setError('Failed to display image');
                }}
            />
        </div>
    );
};

export default TestImageLoader;