// QrCodeGenerator.jsx
import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

// ฟังก์ชันสำหรับแปลง QR Code เป็น dataURL
export const getQRCodeDataUrl = async (bill) => {
  try {
    // สร้าง QR code พื้นฐาน
    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify({
        partNumber: bill.M_PART_NUMBER,
        partDescription: bill.M_PART_DESCRIPTION,
        customer: bill.M_SUBINV,
        date: bill.M_DATE,
        quantity: bill.M_QTY,
      }),
      {
        width: 500, // ขนาดใหญ่พอสำหรับคุณภาพที่ดี
        margin: 1,
        errorCorrectionLevel: 'H', // ระดับการแก้ไขข้อผิดพลาดสูงสุดเพื่อรองรับ logo
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        rendererOpts: {
          quality: 1.0,
        },
      }
    );

    // สร้าง canvas สำหรับรวม QR Code และ logo
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 500; // ขนาดเดียวกับ QR Code
    canvas.width = size;
    canvas.height = size;

    // วาด QR Code บน canvas
    const qrImage = new Image();
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });
    ctx.drawImage(qrImage, 0, 0, size, size);

    try {
      // โหลดและวาง logo
      const logo = new Image();
      await new Promise((resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = reject;
        // ใช้ URL ของ logo (ต้องเปลี่ยนเป็น path ที่ถูกต้องในโปรเจคของคุณ)
        logo.src = '/thairung-logo.png'; // อย่าลืมใส่ logo ไว้ใน public folder
      });

      // คำนวณขนาดและตำแหน่งของ logo
      const logoSize = size * 0.2; // logo ขนาด 20% ของ QR Code
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;

      // วาดพื้นหลังสีขาวรองรับ logo
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, logoSize / 1.8, 0, 2 * Math.PI);
      ctx.fill();

      // วาด logo แบบวงกลม
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, logoSize / 2, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
      ctx.restore();

      // เพิ่มขอบให้กับ logo
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, logoSize / 1.8, 0, 2 * Math.PI);
      ctx.stroke();

    } catch (logoError) {
      console.warn("Failed to add logo to QR code:", logoError);
      // ถ้าใส่ logo ไม่สำเร็จ จะคืนค่า QR Code ปกติ
      return qrDataUrl;
    }

    // แปลง canvas เป็น data URL
    return canvas.toDataURL('image/png');

  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return null;
  }
};

// สำหรับแสดงใน QR Code Popup
export const generateQRCodeElement = (bill) => {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await getQRCodeDataUrl(bill);
        if (url) {
          setQrUrl(url);
        }
      } catch (error) {
        console.error("Error generating QR element:", error);
      }
    };
    generateQR();
  }, [bill]);

  return qrUrl ? (
    <img
      src={qrUrl}
      alt="QR Code"
      className="w-full h-full object-contain"
      style={{ maxWidth: '250px', maxHeight: '250px' }}
    />
  ) : null;
};

export default {
  getQRCodeDataUrl,
  generateQRCodeElement
};