// QrCodeGenerator.jsx
import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

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
        width: 500,
        margin: 1,
        errorCorrectionLevel: 'H',
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        rendererOpts: {
          quality: 1.0,
        },
      }
    );

    // สร้าง canvas
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
      // โหลด logo
      const logo = new Image();
      await new Promise((resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = reject;
        logo.src = '/img/thairung-logo.png';
      });

      // คำนวณขนาดของ logo แบบสี่เหลี่ยมผืนผ้า
      const logoWidth = size * 0.2; // ความกว้าง 40% ของ QR Code
      const logoHeight = logoWidth * (logo.height / logo.width); // คำนวณความสูงตามอัตราส่วน
      const logoX = (size - logoWidth) / 2;
      const logoY = (size - logoHeight) / 2;

      // วาดพื้นหลังสีขาวแบบสี่เหลี่ยม
      const padding = 10; // ระยะห่างขอบ
      ctx.fillStyle = 'white';
      ctx.fillRect(
        logoX - padding,
        logoY - padding,
        logoWidth + (padding * 2),
        logoHeight + (padding * 2)
      );

      // วาด logo
      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

      // เพิ่มขอบ
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.strokeRect(
        logoX - padding,
        logoY - padding,
        logoWidth + (padding * 2),
        logoHeight + (padding * 2)
      );

      // เพิ่มเงา (optional)
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

    } catch (logoError) {
      console.warn("Failed to add logo to QR code:", logoError);
      return qrDataUrl;
    }

    return canvas.toDataURL('image/png');

  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return null;
  }
};

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