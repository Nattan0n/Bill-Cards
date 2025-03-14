import React, { useState, useEffect } from "react";
import { getQRCodeDataUrl } from "./QrCodeGenerator";
import { PartImage } from "../../../services/partImageService";
import { imageApi } from "../../../utils/axios";

// สร้างรูปภาพที่แสดงเฉพาะ Part Number
const createPartNumberImage = (partNumber = "Part Number") => {
  const canvas = document.createElement("canvas");
  canvas.width = 150;
  canvas.height = 150;
  const ctx = canvas.getContext("2d");

  // พื้นหลังสีขาว
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 150, 150);

  // วาดเส้นขอบ
  ctx.strokeStyle = "#dddddd";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 150, 150);

  // เขียนข้อความ Part Number ตรงกลาง
  ctx.fillStyle = "#333333";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(partNumber, 75, 75);

  return canvas.toDataURL("image/png");
};

const QrCodePopup = ({ bills, onClose }) => {
  const [billsWithQR, setBillsWithQR] = useState([]);
  const [isClosing, setIsClosing] = useState(false);

  // Generate QR codes when component mounts
  useEffect(() => {
    const generateQRCodes = async () => {
      try {
        // Set up constants for URLs
        const BASE_URL = "http://129.200.6.50:83";
        const DEFAULT_IMAGE = "No_Image_Available.jpg";
        const defaultImageUrl = `${BASE_URL}/storage/images/${DEFAULT_IMAGE}`;

        // Fetch all image information from API once
        let imagesMap = new Map();
        try {
          const response = await imageApi.get("/api/images");
          // Extract image paths from API response
          imagesMap = new Map(
            response.data.map((img) => [
              img.partNumber,
              // Make sure we use the full URL from the API response
              img.imagePath.startsWith("http")
                ? img.imagePath
                : `${BASE_URL}/storage/images/${img.imagePath}`,
            ])
          );
          console.log("Loaded images map with", imagesMap.size, "entries");
        } catch (error) {
          console.error("Failed to fetch images from API:", error);
        }

        // Process bills to include QR codes and images
        const billsWithQRCodes = await Promise.all(
          bills.map(async (bill) => {
            // Generate QR code
            const qrCodeUrl = await getQRCodeDataUrl(bill);

            // Create fallback image with part number
            const partNumberImage = createPartNumberImage(bill.M_PART_NUMBER);

            // Find image URL for this part number
            let partImageUrl = defaultImageUrl;

            if (imagesMap.has(bill.M_PART_NUMBER)) {
              partImageUrl = imagesMap.get(bill.M_PART_NUMBER);
            }

            // Log the image URL found for debugging
            console.log(`Part ${bill.M_PART_NUMBER} image URL:`, partImageUrl);

            return {
              ...bill,
              qrCodeUrl,
              partNumberImage,
              partImageUrl,
            };
          })
        );

        setBillsWithQR(billsWithQRCodes);
      } catch (error) {
        console.error("Error generating QR codes:", error);
        alert("เกิดข้อผิดพลาดในการสร้าง QR code");
      }
    };

    generateQRCodes();
  }, [bills]);

  // ฟังก์ชันพิมพ์ที่ปรับปรุงแล้ว
  const handlePrint = async () => {
    try {
      // ค่าคงที่สำหรับ URLs และค่าเริ่มต้น
      const BASE_URL = "http://129.200.6.50:83";
      const DEFAULT_IMAGE = "No_Image_Available.jpg";
      const defaultImageUrl = `${BASE_URL}/storage/images/${DEFAULT_IMAGE}`;

      // ตั้งค่าขนาดรูปภาพ
      const imageWidth = 250;
      const imageHeight = 200;

      // สร้างหน้าต่างพิมพ์
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        alert("กรุณาอนุญาตให้เปิดหน้าต่างป๊อปอัพเพื่อพิมพ์");
        return;
      }

      // เตรียมข้อมูลสำหรับพิมพ์
      const billsToPrint = billsWithQR.map((bill) => {
        let partImageUrl = bill.partImageUrl || defaultImageUrl;
        return {
          ...bill,
          partImageUrl,
        };
      });

      // เขียน HTML ลงในหน้าต่างพิมพ์ด้วย CSS ที่บังคับให้พิมพ์สี
      printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Codes</title>
          <style>
            @page {
              size: A4;
              margin: 0.5cm;
              color-adjust: exact;
            }

            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }

            .print-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              padding: 15px;
            }

            .qr-item {
              break-inside: avoid;
              page-break-inside: avoid;
              padding: 15px;
              border: 1px solid #ccc;
              margin-bottom: 15px;
              color: black;
              background-color: white;
            }

            /* ตารางข้อมูลแบบเดิม */
            .info-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin-bottom: 10px;
            }

            .info-table td {
              padding: 3px 2px;
              vertical-align: top;
            }

            .info-label {
              text-align: left;
              font-weight: bold;
              white-space: nowrap;
              color: #000;
              font-size: 16px; /* เพิ่มขนาดฟอนต์ของป้ายชื่อทั้งหมด */
            }

            .info-separator {
              text-align: center;
              width: 20px;
              font-weight: normal;
              color: #000;
              font-size: 16px;
            }

            .info-value {
              text-align: right;
              font-weight: 600;
              color: #000;
              word-break: break-all;
              word-wrap: break-word;
              font-size: 18px; /* เพิ่มขนาดฟอนต์ของข้อมูลทั่วไป */
            }

            /* ปรับ Part Number ให้ใหญ่และเด่นมากขึ้น */
            .part-number-value {
              font-weight: bold;
              color: #0056b3;
              font-size: 24px; /* เพิ่มขนาดใหญ่ขึ้นมาก */
              letter-spacing: 0.5px; /* เพิ่มระยะห่างระหว่างตัวอักษร */
            }

            /* เพิ่มสไตล์สำหรับ Part Number Label */
            .part-number-label {
              font-size: 20px; /* เพิ่มขนาดสำหรับป้ายชื่อ Part Number */
              font-weight: bold;
              color: #333;
            }

            .qr-image-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 15px;
              margin-top: 10px;
            }

            .qr-image {
              width: ${imageWidth}px !important;
              height: ${imageHeight}px !important;
              object-fit: fill !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              border: 1px solid #eee;
              background-color: white;
            }
            
            /* เพิ่มการกำหนดเป็นสีซ้ำๆ หลายที่เพื่อให้แน่ใจว่าจะไม่ถูกเขียนทับ */
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              img {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              .qr-image {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              /* ป้องกันการตัดขอบรูปภาพเมื่อพิมพ์ */
              .qr-image-container {
                margin: 0;
                padding: 0;
              }
              
              body, html {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }

            .no-print {
              display: none !important;
            }
            
            /* ปุ่มต่างๆในส่วนคอนโทรล */
            .print-controls {
              padding: 15px;
              background: #f0f0f0; 
              margin-bottom: 15px;
            }
            
            .control-button {
              padding: 8px 15px;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              margin-right: 10px;
              font-weight: bold;
            }
            
            .print-button {
              background: #4CAF50;
            }
            
            .larger-button {
              background: #2196F3;
            }
            
            .smaller-button {
              background: #FF9800;
            }
            
            .mode-button {
              background: #9C27B0;
            }
            
            .color-button {
              background: #E91E63;
            }
            
            /* เพิ่มเส้นขอบให้ชัดเจนขึ้น */
            .qr-item {
              border: 2px solid #aaa;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="print-controls no-print">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h2 style="margin: 0;">QR Code Print Preview</h2>
              <div>
                <button onclick="window.print()" class="control-button print-button">Print</button>
                <button onclick="adjustSize('larger')" class="control-button larger-button">Larger Images</button>
                <button onclick="adjustSize('smaller')" class="control-button smaller-button">Smaller Images</button>
                <button onclick="adjustImageFit()" class="control-button mode-button">Switch Fit Mode</button>
                <button onclick="prepareForColorPrint()" class="control-button color-button">Force Color Print</button>
              </div>
            </div>
          </div>
          
          <div class="print-container">
            ${billsToPrint
              .map(
                (bill, index) => `
              <div class="qr-item">
                <table class="info-table">
                  <tr>
                    <td class="info-label part-number-label">Part Number:</td>
                    <td class="info-separator"></td>
                    <td class="info-value part-number-value">${
                      bill.M_PART_NUMBER
                    }</td>
                  </tr>
                  <tr>
                    <td class="info-label">Description:</td>
                    <td class="info-separator"></td>
                    <td class="info-value">${bill.M_PART_DESCRIPTION || ""}</td>
                  </tr>
                  <tr>
                    <td class="info-label">Subinventory:</td>
                    <td class="info-separator"></td>
                    <td class="info-value">${bill.M_SUBINV || ""}</td>
                  </tr>
                  ${
                    bill.M_DATE
                      ? `
                  <tr>
                    <td class="info-label">Generate QR Code By Date:</td>
                    <td class="info-separator"></td>
                    <td class="info-value">${
                      bill.M_DATE.split("T")[0] || ""
                    }</td>
                  </tr>
                  `
                      : ""
                  }
                </table>
                <div class="qr-image-container">
                  <img 
                    src="${bill.qrCodeUrl}" 
                    alt="QR Code" 
                    class="qr-image"
                    style="object-fit: fill;"
                  />
                  <img 
                    src="${bill.partImageUrl}" 
                    alt="${bill.M_PART_NUMBER}" 
                    class="qr-image"
                    style="object-fit: fill; background-color: white;"
                    onerror="this.onerror=null; this.src='${defaultImageUrl}'; console.log('Image failed to load:', this.alt);"
                  />
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          
          <script>
            // ฟังก์ชันสำหรับปรับขนาดรูปภาพ
            function adjustSize(mode) {
              const images = document.querySelectorAll('.qr-image');
              images.forEach(img => {
                const currentWidth = parseInt(img.style.width || img.width || ${imageWidth});
                const currentHeight = parseInt(img.style.height || img.height || ${imageHeight});
                
                if (mode === 'larger') {
                  const newWidth = (currentWidth * 1.2) + 'px';
                  const newHeight = (currentHeight * 1.2) + 'px';
                  img.style.width = newWidth;
                  img.style.height = newHeight;
                  console.log('Increased image size to:', newWidth, 'x', newHeight);
                } else if (mode === 'smaller') {
                  const newWidth = (currentWidth * 0.9) + 'px';
                  const newHeight = (currentHeight * 0.9) + 'px';
                  img.style.width = newWidth;
                  img.style.height = newHeight;
                  console.log('Decreased image size to:', newWidth, 'x', newHeight);
                }
              });
            }
            
            // ฟังก์ชันสำหรับสลับโหมดการแสดงรูปภาพ
            function adjustImageFit() {
              const images = document.querySelectorAll('.qr-image');
              images.forEach(img => {
                const currentFit = img.style.objectFit;
                if (currentFit === 'fill' || currentFit === '') {
                  img.style.objectFit = 'contain';
                  console.log('Changed to contain mode');
                } else {
                  img.style.objectFit = 'fill';
                  console.log('Changed to fill mode');
                }
              });
            }
            
            // ฟังก์ชันเพื่อเตรียมการพิมพ์สี
            function prepareForColorPrint() {
              // เพิ่ม style เข้าไปใน head
              const styleEl = document.createElement('style');
              styleEl.innerHTML = \`
                @media print {
                  * { 
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                  }
                }
              \`;
              document.head.appendChild(styleEl);
              
              // เปลี่ยน background ของบางส่วนให้ชัดเจนขึ้น
              document.querySelectorAll('.qr-item').forEach(item => {
                item.style.backgroundColor = '#ffffff';
                item.style.border = '2px solid #333333';
              });
              
              // แจ้งเตือนผู้ใช้
              alert('เตรียมพร้อมสำหรับการพิมพ์สีแล้ว! กรุณาตรวจสอบว่าตั้งค่าการพิมพ์เป็นสีในหน้าถัดไป');
              
              // พร้อมสำหรับการพิมพ์
              setTimeout(() => {
                window.print();
              }, 300);
            }
            
            // ตั้งค่าเริ่มต้นสำหรับการพิมพ์
            window.onload = function() {
              // บังคับให้ใช้การพิมพ์สี (บางเบราว์เซอร์อาจไม่รองรับ)
              if (window.matchMedia) {
                const mediaQueryList = window.matchMedia('print');
                mediaQueryList.addListener(function(mql) {
                  if (mql.matches) {
                    document.body.setAttribute('data-force-color', 'true');
                  }
                });
              }
            };
            
            // คำสั่งเมื่อพิมพ์เสร็จ
            window.onafterprint = function() {
              window.close();
            };
          </script>
        </body>
      </html>
    `);

      printWindow.document.close();
    } catch (error) {
      console.error("Error preparing print:", error);
      alert("เกิดข้อผิดพลาดในการเตรียมการพิมพ์");
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-gray-900/45"
        onClick={handleClose}
        aria-hidden="true"
      ></div>

      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-center min-h-screen p-4">
        <div
          className={`relative w-11/12 max-w-6xl max-h-[90vh] bg-white/85 rounded-3xl shadow-2xl animate__animated animate__faster ${
            isClosing ? "animate__zoomOut" : "animate__zoomIn"
          }`}
        >
          {/* Header with improved gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 rounded-t-2xl px-6 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-3xl text-white mr-3 animate-bounce">
                  qr_code_2
                </span>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    QR Code Generator
                  </h2>
                  <p className="text-xs text-blue-100 mt-0.5 tracking-wide">
                    Generate QR codes for selected items
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-200 group hover:shadow-lg"
                >
                  <span className="material-symbols-outlined mr-2 group-hover:animate-bounce">
                    print
                  </span>
                  <span className="font-medium">Print QR Codes</span>
                </button>
                <button
                  onClick={handleClose}
                  className="flex items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-red-500 text-white transition-all duration-200 backdrop-blur-sm group"
                >
                  <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-200">
                    close
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)] bg-gradient-to-b from-gray-50 to-white rounded-b-3xl">
            <div className="grid grid-cols-2 gap-6">
              {billsWithQR.map((bill, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)] hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="material-symbols-outlined text-xl p-2 rounded-xl">
                          qr_code
                        </span>
                        <span className="font-medium text-lg">
                          #{index + 1}
                        </span>
                      </div>
                      {/* <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        <span className="text-sm font-medium">
                          {bill.M_DATE}
                        </span>
                      </div> */}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-5">
                    {/* Part Information */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="text-sm text-gray-500 mb-1">
                          Part Number
                        </div>
                        <div className="font-semibold">
                          {bill.M_PART_NUMBER}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="text-sm text-gray-500 mb-1">
                          Description
                        </div>
                        <div className="font-semibold line-clamp-2">
                          {bill.M_PART_DESCRIPTION}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <div className="text-center font-medium text-gray-700">
                            {bill.M_SUBINV}
                          </div>
                        </div>
                        {/* <div className="bg-gray-50 p-3 rounded-xl">
                          <div className="text-center font-medium text-gray-700">
                            {bill.TRANSACTION_TYPE_NAME || "Initial"}
                          </div>
                        </div> */}
                      </div>
                    </div>

                    {/* QR Code and Part Image Container */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* QR Code */}
                      <div className="bg-gradient-to-b from-gray-50 to-white p-4 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                        <div className="flex justify-center">
                          {bill.qrCodeUrl && (
                            <img
                              src={bill.qrCodeUrl}
                              alt={`QR Code for ${bill.M_PART_NUMBER}`}
                              className="w-32 h-32 transition-transform duration-300 group-hover:scale-105"
                            />
                          )}
                        </div>
                      </div>

                      {/* Part Image */}
                      <div className="bg-gradient-to-b from-gray-50 to-white p-4 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                        <div className="flex justify-center items-center h-32">
                          <PartImage
                            partNumber={bill.M_PART_NUMBER}
                            width="w-32"
                            height="h-32"
                            className="object-contain"
                            id={`part-image-${bill.M_PART_NUMBER}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div
          className={`fixed inset-0 flex flex-col bg-white/85 animate__animated animate__faster ${
            isClosing ? "animate__zoomOut" : "animate__zoomIn"
          }`}
        >
          {/* Mobile Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 px-4 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-2xl text-white mr-3 animate-bounce">
                  qr_code_2
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    QR Codes
                  </h2>
                  <p className="text-xs text-blue-100 mt-0.5 tracking-wide">
                    Generated QR codes
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="flex p-2.5 hover:bg-white/10 rounded-xl transition-all duration-200 group"
                >
                  <span className="material-symbols-outlined text-white group-hover:scale-110 transition-transform">
                    print
                  </span>
                </button>
                <button
                  onClick={handleClose}
                  className="flex items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-red-500 text-white transition-all duration-200 backdrop-blur-sm group"
                >
                  <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-200">
                    close
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {billsWithQR.map((bill, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-md overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="material-symbols-outlined text-lg p-2 rounded-xl">
                          qr_code
                        </span>
                        <span className="font-medium">#{index + 1}</span>
                      </div>
                      {/* <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        <span className="text-sm">{bill.M_DATE}</span>
                      </div> */}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-4">
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="text-sm text-gray-500 mb-1">
                          Part Number
                        </div>
                        <div className="font-semibold">
                          {bill.M_PART_NUMBER}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="text-sm text-gray-500 mb-1">
                          Description
                        </div>
                        <div className="font-semibold line-clamp-2">
                          {bill.M_PART_DESCRIPTION}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="text-center font-medium text-gray-700">
                          {bill.M_SUBINV}
                        </div>
                      </div>
                    </div>

                    {/* QR Code and Part Image Container */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* QR Code */}
                      <div className="bg-gradient-to-b from-gray-50 to-white p-3 rounded-xl border border-gray-100">
                        <div className="flex justify-center">
                          {bill.qrCodeUrl && (
                            <img
                              src={bill.qrCodeUrl}
                              alt={`QR Code for ${bill.M_PART_NUMBER}`}
                              className="w-28 h-28"
                            />
                          )}
                        </div>
                      </div>

                      {/* Part Image */}
                      <div className="bg-gradient-to-b from-gray-50 to-white p-3 rounded-xl border border-gray-100">
                        <div className="flex justify-center items-center h-28">
                          <PartImage
                            partNumber={bill.M_PART_NUMBER}
                            width="w-28"
                            height="h-28"
                            className="object-contain"
                            id={`mobile-part-image-${bill.M_PART_NUMBER}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrCodePopup;
