import React, { useState, useEffect } from "react";
import { getQRCodeDataUrl } from "./QrCodeGenerator";

const QrCodePopup = ({ bills, onClose }) => {
  const [billsWithQR, setBillsWithQR] = useState([]);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const generateQRCodes = async () => {
      const billsWithQRCodes = await Promise.all(
        bills.map(async (bill) => {
          const qrCodeUrl = await getQRCodeDataUrl(bill);
          return { ...bill, qrCodeUrl };
        })
      );
      setBillsWithQR(billsWithQRCodes);
    };

    generateQRCodes();
  }, [bills]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Codes</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0.5cm;
              }
  
              body {
                margin: 0;
                padding: 0;
              }
  
              .no-print {
                display: none !important;
              }
  
              .print-container {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                padding: 10px;
                background-color: white !important;
              }
  
              .qr-item {
                break-inside: avoid;
                page-break-inside: avoid;
                padding: 15px;
                border: 1px solid #ccc !important;
                margin-bottom: 10px;
                background-color: white !important;
                color: black !important;
              }
  
              .qr-info {
                margin-bottom: 10px;
                font-size: 12px;
              }
  
              .qr-info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
  
              .qr-info-label {
                font-weight: bold;
                color: black !important;
              }
  
              .qr-info-value {
                color: black !important;
                text-align: right;
              }
  
              .qr-image-container {
                display: flex;
                justify-content: center;
                background-color: white !important;
                padding: 10px;
              }
  
              .qr-image {
                width: 150px !important;
                height: 150px !important;
              }
  
              * {
                color: black !important;
                background-color: white !important;
                border-color: #ccc !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${billsWithQR
              .map(
                (bill, index) => `
              <div class="qr-item">
                <div class="qr-info">
                  <div class="qr-info-row">
                    <span class="qr-info-label">Part Number:</span>
                    <span class="qr-info-value">${bill.M_PART_NUMBER}</span>
                  </div>
                  <div class="qr-info-row">
                    <span class="qr-info-label">Description:</span>
                    <span class="qr-info-value">${
                      bill.M_PART_DESCRIPTION || ""
                    }</span>
                  </div>
                  <div class="qr-info-row">
                    <span class="qr-info-label">Customer:</span>
                    <span class="qr-info-value">${bill.M_SUBINV}</span>
                  </div>
                  <div class="qr-info-row">
                    <span class="qr-info-label">Date:</span>
                    <span class="qr-info-value">${bill.M_DATE}</span>
                  </div>
                  ${
                    Number(bill.M_QTY) > 0
                      ? `
                    <div class="qr-info-row">
                      <span class="qr-info-label">Quantity In:</span>
                      <span class="qr-info-value">${Math.abs(
                        Number(bill.M_QTY)
                      )}</span>
                    </div>
                  `
                      : `
                    <div class="qr-info-row">
                      <span class="qr-info-label">Quantity Out:</span>
                      <span class="qr-info-value">-${Math.abs(
                        Number(bill.M_QTY)
                      )}</span>
                    </div>
                  `
                  }
                </div>
                <div class="qr-image-container">
                  <img 
                    src="${bill.qrCodeUrl}" 
                    alt="QR Code" 
                    class="qr-image"
                  />
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500); // ให้เวลาในการเล่น animation ก่อนที่จะปิด
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with better blur effect */}
      <div
        className="absolute inset-0 bg-gray-900/45 transition-opacity"
        onClick={onClose}
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
                      <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        <span className="text-sm font-medium">
                          {bill.M_DATE}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-5">
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
                        <div className="bg-blue-50 p-3 rounded-xl">
                          <div className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">
                              inventory
                            </span>
                            <span
                              className={`font-medium ${
                                Number(bill.M_QTY) > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {Number(bill.M_QTY) > 0
                                ? `+${Math.abs(Number(bill.M_QTY))}`
                                : `-${Math.abs(Number(bill.M_QTY))}`}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <div className="text-center font-medium text-gray-700">
                            {bill.M_SUBINV}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code with improved container */}
                    <div className="bg-gradient-to-b from-gray-50 to-white p-5 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                      <div className="flex justify-center">
                        {bill.qrCodeUrl && (
                          <img
                            src={bill.qrCodeUrl}
                            alt={`QR Code for ${bill.M_PART_NUMBER}`}
                            className="w-48 h-48 transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
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
        <div className={`fixed inset-0 flex flex-col bg-white/85 animate__animated animate__faster ${
            isClosing ? "animate__zoomOut" : "animate__zoomIn"
          }`}>
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
                      <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        <span className="text-sm">{bill.M_DATE}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-5">
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
                        <div className="bg-blue-50 p-3 rounded-xl">
                          <div className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">
                              inventory
                            </span>
                            <span
                              className={`font-medium ${
                                Number(bill.M_QTY) > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {Number(bill.M_QTY) > 0
                                ? `+${Math.abs(Number(bill.M_QTY))}`
                                : `-${Math.abs(Number(bill.M_QTY))}`}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <div className="text-center font-medium text-gray-700">
                            {bill.M_SUBINV}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Code container */}
                    <div className="bg-gradient-to-b from-gray-50 to-white p-4 rounded-2xl border border-gray-100">
                      <div className="flex justify-center">
                        {bill.qrCodeUrl && (
                          <img
                            src={bill.qrCodeUrl}
                            alt={`QR Code for ${bill.M_PART_NUMBER}`}
                            className="w-40 h-40"
                          />
                        )}
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