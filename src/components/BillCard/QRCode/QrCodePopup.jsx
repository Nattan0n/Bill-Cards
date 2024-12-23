// QrCodePopup.jsx
import React, { useState } from "react";
import { useQRCodeBatchGenerator, QRGenerationLoading } from "./QrCodeGenerator";

const QrCodePopup = ({ bills, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const { billsWithQR, isLoading, progress, error } = useQRCodeBatchGenerator(bills);

  const handleClose = () => {
    if (isLoading) {
      const confirmClose = window.confirm('QR Code generation is in progress. Are you sure you want to cancel?');
      if (!confirmClose) return;
    }
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500);
  };

  const handlePrint = () => {
    if (isLoading || billsWithQR.length === 0) return;

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
              .print-container {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                padding: 10px;
              }
              .qr-item {
                break-inside: avoid;
                page-break-inside: avoid;
                padding: 15px;
                border: 1px solid #ccc;
                margin-bottom: 10px;
              }
              .qr-image {
                width: 150px !important;
                height: 150px !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${billsWithQR.map((bill, index) => `
              <div class="qr-item">
                <div class="qr-info">
                  <p><strong>Part Number:</strong> ${bill.M_PART_NUMBER}</p>
                  <p><strong>Description:</strong> ${bill.M_PART_DESCRIPTION || ""}</p>
                  <p><strong>Customer:</strong> ${bill.M_SUBINV}</p>
                  <p><strong>Date:</strong> ${bill.M_DATE}</p>
                  <p><strong>Quantity:</strong> ${Math.abs(Number(bill.M_QTY))}</p>
                </div>
                <div style="display: flex; justify-content: center; padding: 10px;">
                  <img src="${bill.qrCodeUrl}" alt="QR Code" class="qr-image"/>
                </div>
              </div>
            `).join("")}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-gray-900/45 backdrop-blur-sm"
        onClick={handleClose}
      />

      {isLoading && <QRGenerationLoading progress={progress} />}

      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className={`relative w-11/12 max-w-6xl max-h-[90vh] bg-white/85 rounded-3xl shadow-2xl animate__animated animate__faster ${
            isClosing ? "animate__zoomOut" : "animate__zoomIn"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 rounded-t-2xl px-6 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-3xl text-white mr-3">
                  qr_code_2
                </span>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    QR Code Generator
                  </h2>
                  <p className="text-xs text-blue-100 mt-0.5 tracking-wide">
                    {isLoading
                      ? `Generating: ${progress}% complete`
                      : `Generated ${billsWithQR.length} QR codes`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrint}
                  disabled={isLoading || billsWithQR.length === 0}
                  className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-200 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined mr-2">print</span>
                  <span className="font-medium">Print QR Codes</span>
                </button>
                <button
                  onClick={handleClose}
                  className="flex items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-red-500 text-white transition-all duration-200"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)] bg-gradient-to-b from-gray-50 to-white rounded-b-3xl">
            {error ? (
             <div className="text-center p-8">
             <div className="text-red-500 mb-4">{error}</div>
             <button
               onClick={() => window.location.reload()}
               className="px-4 py-2 bg-blue-500 text-white rounded-lg"
             >
               Retry
             </button>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {billsWithQR.map((bill, index) => (
               <div
                 key={`${bill.M_PART_NUMBER}-${index}`}
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

                   {/* QR Code Container */}
                   <div className="bg-gradient-to-b from-gray-50 to-white p-5 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                     <div className="flex justify-center">
                       {bill.qrCodeUrl ? (
                         <img
                           src={bill.qrCodeUrl}
                           alt={`QR Code for ${bill.M_PART_NUMBER}`}
                           className="w-48 h-48 transition-transform duration-300 group-hover:scale-105"
                         />
                       ) : bill.error ? (
                         <div className="flex items-center justify-center h-48 bg-red-50 rounded-lg w-full">
                           <p className="text-red-500 text-center">
                             Failed to generate QR code
                             <br />
                             <button
                               onClick={() => window.location.reload()}
                               className="mt-2 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                             >
                               Retry
                             </button>
                           </p>
                         </div>
                       ) : (
                         <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg w-full">
                           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
     </div>
   </div>
 </div>
);
};

export default QrCodePopup;