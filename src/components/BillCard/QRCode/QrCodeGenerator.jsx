// QrCodeGenerator.jsx
import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

// ฟังก์ชันสร้าง QR Code สำหรับ mobile
const generateMobileQRCode = async (bill) => {
  try {
    const qrData = bill.M_PART_NUMBER;

    const options = {
      width: 200,
      margin: 0,
      errorCorrectionLevel: 'L',
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      rendererOpts: {
        quality: 0.5
      }
    };

    return await QRCode.toDataURL(qrData, options);
  } catch (error) {
    console.error("Mobile QR generation error:", error);
    throw error;
  }
};

// ฟังก์ชันสร้าง QR Code สำหรับ desktop
const generateDesktopQRCode = async (bill) => {
  try {
    const qrData = bill.M_PART_NUMBER;

    const options = {
      width: 500,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: "#000000",
        light: "#ffffff",
      }
    };

    const qrDataUrl = await QRCode.toDataURL(qrData, options);

    // เพิ่ม logo สำหรับ desktop
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 500;
    canvas.width = size;
    canvas.height = size;

    // วาด QR Code
    const qrImage = new Image();
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });
    ctx.drawImage(qrImage, 0, 0, size, size);

    try {
      const logo = new Image();
      await new Promise((resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = reject;
        logo.src = "/img/thairung-logo.png";
        setTimeout(reject, 2000);
      });

      const logoWidth = size * 0.2;
      const logoHeight = logoWidth * (logo.height / logo.width);
      const logoX = (size - logoWidth) / 2;
      const logoY = (size - logoHeight) / 2;

      ctx.fillStyle = 'white';
      ctx.fillRect(logoX - 5, logoY - 5, logoWidth + 10, logoHeight + 10);
      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
      
      return canvas.toDataURL('image/png', 1.0);
    } catch (error) {
      console.warn("Logo loading failed:", error);
      return qrDataUrl;
    }
  } catch (error) {
    console.error("Desktop QR generation error:", error);
    throw error;
  }
};

// ฟังก์ชันสร้าง batch สำหรับ mobile
const generateMobileBatch = async (bills, startIndex, batchSize, onProgress) => {
  const batch = bills.slice(startIndex, startIndex + batchSize);
  const results = [];

  for (const bill of batch) {
    try {
      const qrCodeUrl = await generateMobileQRCode(bill);
      results.push({ ...bill, qrCodeUrl });
      
      // delay ระหว่าง items
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Error generating mobile QR for bill ${bill.M_PART_NUMBER}:`, error);
      results.push({ ...bill, error: true });
    }
  }

  return results;
};

// ฟังก์ชันสร้าง batch สำหรับ desktop
const generateDesktopBatch = async (bills, startIndex, batchSize, onProgress) => {
  const batch = bills.slice(startIndex, startIndex + batchSize);
  const results = [];

  for (const bill of batch) {
    try {
      const qrCodeUrl = await generateDesktopQRCode(bill);
      results.push({ ...bill, qrCodeUrl });
    } catch (error) {
      console.error(`Error generating desktop QR for bill ${bill.M_PART_NUMBER}:`, error);
      results.push({ ...bill, error: true });
    }
  }

  return results;
};

// Hook หลักสำหรับ generate QR codes
export const useQRCodeBatchGenerator = (bills) => {
  const [billsWithQR, setBillsWithQR] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateQRCodes = async () => {
      if (!bills?.length) return;

      const isMobile = window.innerWidth <= 768;
      setIsLoading(true);
      setProgress(0);
      setBillsWithQR([]);
      setError(null);

      try {
        const batchSize = isMobile ? 2 : 10;
        const allResults = [];

        for (let i = 0; i < bills.length; i += batchSize) {
          const batchResults = isMobile
            ? await generateMobileBatch(bills, i, batchSize)
            : await generateDesktopBatch(bills, i, batchSize);

          allResults.push(...batchResults);

          const progress = Math.min(
            Math.round(((i + batchSize) / bills.length) * 100),
            100
          );
          setProgress(progress);
          setBillsWithQR([...allResults]);

          // delay ระหว่าง batches
          if (isMobile) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }

        setProgress(100);
        setBillsWithQR(allResults);
      } catch (error) {
        console.error("QR generation error:", error);
        setError(error.message || "Failed to generate QR codes");
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCodes();

    return () => {
      setBillsWithQR([]);
      setProgress(0);
      setError(null);
    };
  }, [bills]);

  return {
    billsWithQR,
    isLoading,
    progress,
    error
  };
};

// Component แสดง loading
export const QRGenerationLoading = ({ progress }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 w-full">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-semibold mb-2">Generating QR Codes</h3>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500">{progress}% Complete</p>
      </div>
    </div>
  </div>
);