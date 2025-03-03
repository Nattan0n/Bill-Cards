import QRCode from 'qrcode';
import Logo from '../../../assets/images/thairung-logo.png';

export const getQRCodeDataUrl = async (bill) => {
  try {
    // ตรวจสอบว่ามีภาษาไทยใน subinventory หรือไม่
    const hasThaiChars = /[\u0E00-\u0E7F]/.test(bill.M_SUBINV || bill.secondary_inventory || "");
    
    // Comprehensive QR Code data generation with Base64 encoding for Thai text
    const qrData = {
      // ข้อมูลหลัก
      partNumber: bill.M_PART_NUMBER || bill.part_number,
      inventory_item_id: bill.inventory_item_id || bill.inv_item_id,
      
      // เก็บค่าดั้งเดิมไว้ (สำหรับความเข้ากันได้กับระบบเดิม)
      subinventory: bill.M_SUBINV || bill.secondary_inventory,
      
      // เพิ่มการเข้ารหัส Base64 สำหรับข้อมูลภาษาไทย
      subinventory_encoded: hasThaiChars 
        ? btoa(encodeURIComponent(bill.M_SUBINV || bill.secondary_inventory || ""))
        : null
    };

    // ลบค่า null
    if (!qrData.subinventory_encoded) {
      delete qrData.subinventory_encoded;
    }

    // แสดงข้อมูลที่จะเข้ารหัสเป็น QR
    console.log("QR data to encode:", qrData);

    // Ensure all fields are strings and trimmed
    Object.keys(qrData).forEach(key => {
      qrData[key] = qrData[key] ? String(qrData[key]).trim() : '';
    });

    // Generate QR Code with comprehensive options
    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify(qrData),
      {
        width: 500,
        margin: 1,
        errorCorrectionLevel: "H",
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        rendererOpts: {
          quality: 1.0,
        },
      }
    );

    // Canvas processing for adding logo
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = 500;
    canvas.width = size;
    canvas.height = size;

    // Draw QR Code
    const qrImage = new Image();
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });
    ctx.drawImage(qrImage, 0, 0, size, size);

    try {
      // Load logo
      const logo = new Image();
      await new Promise((resolve, reject) => {
        logo.onload = resolve;
        logo.onerror = reject;
        logo.src = Logo;
      });

      // Calculate logo dimensions
      const logoWidth = size * 0.2;
      const logoHeight = logoWidth * (logo.height / logo.width);
      const logoX = (size - logoWidth) / 2;
      const logoY = (size - logoHeight) / 2;

      // Add white background for logo
      const padding = 10;
      ctx.fillStyle = "white";
      ctx.fillRect(
        logoX - padding,
        logoY - padding,
        logoWidth + padding * 2,
        logoHeight + padding * 2
      );

      // Draw logo
      ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

      // Add border
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.strokeRect(
        logoX - padding,
        logoY - padding,
        logoWidth + padding * 2,
        logoHeight + padding * 2
      );

      // Add shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } catch (logoError) {
      console.warn("Failed to add logo to QR code:", logoError);
      return qrDataUrl;
    }

    return canvas.toDataURL("image/png");
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
      style={{ maxWidth: "250px", maxHeight: "250px" }}
    />
  ) : null;
};

export default {
  getQRCodeDataUrl,
  generateQRCodeElement,
};