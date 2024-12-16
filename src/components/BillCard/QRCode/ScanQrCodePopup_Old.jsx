import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import BillDetailPopup from "../Table/view/BillDetail/BillDetailPopup";
import { Camera, X, Loader2 } from "lucide-react";

const ScanQrCodePopup = ({ isOpen, onClose, onSearch, bills }) => {
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMessage, setScanningMessage] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const webcamRef = useRef(null);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setScanningMessage("กำลังสแกน QR Code...");

      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) {
        throw new Error("ไม่สามารถถ่ายภาพได้");
      }

      const img = new Image();
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(reject, 3000);
      });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (!code) {
        setScanningMessage("ไม่พบ QR Code กรุณาลองใหม่อีกครั้ง");
        setTimeout(() => setScanningMessage(""), 2000);
        return;
      }

      setScanningMessage("กำลังตรวจสอบข้อมูล...");

      try {
        const qrData = JSON.parse(code.data);
        console.log("Scanned QR Data:", qrData);

        const foundBill = bills.find((bill) => {
          const cleanPartNumber = (str) => str?.toString().trim().toLowerCase();
          const cleanDescription = (str) =>
            str?.toString().trim().toLowerCase();

          return (
            cleanPartNumber(bill.M_PART_NUMBER) ===
              cleanPartNumber(qrData.partNumber) ||
            cleanDescription(bill.M_PART_DESCRIPTION) ===
              cleanDescription(qrData.partDescription)
          );
        });

        console.log("Found bill:", foundBill);

        if (foundBill) {
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          setSelectedBill(foundBill);
          setShowDetailPopup(true);
        } else {
          alert(
            "ไม่พบข้อมูล Bill ที่ตรงกับ QR Code\n\n" +
              "ข้อมูลที่สแกนได้:\n" +
              `Part Number: ${qrData.partNumber}\n` +
              `Description: ${qrData.partDescription}\n` +
              `Customer: ${qrData.customer}\n` +
              `Date: ${qrData.date}\n` +
              `Quantity: ${qrData.quantity}`
          );
        }
      } catch (error) {
        console.error("Error parsing QR code data:", error);
        alert("QR Code ไม่ถูกต้อง: " + code.data);
      }
    } catch (error) {
      console.error("Scanning error:", error);
      setScanningMessage("เกิดข้อผิดพลาดในการสแกน กรุณาลองใหม่");
      setTimeout(() => setScanningMessage(""), 2000);
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 500);
  };

  const handleCloseDetail = () => {
    setShowDetailPopup(false);
    setSelectedBill(null);
    onClose();
  };

  if (!isOpen && !showDetailPopup) return null;

  return (
    <>
      <div className="fixed inset-0 z-50">
        <style>
          {`
            @keyframes scanLine {
              0% { top: 0%; }
              100% { top: 100%; }
            }
            .scanning-line {
              position: absolute;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(
                to right,
                transparent 0%,
                rgba(255, 0, 0, 0.4) 20%,
                rgba(255, 0, 0, 0.8) 50%,
                rgba(255, 0, 0, 0.4) 80%,
                transparent 100%
              );
              box-shadow: 0 0 4px rgba(255, 0, 0, 0.5),
                         0 0 8px rgba(255, 0, 0, 0.3),
                         0 0 12px rgba(255, 0, 0, 0.2);
              animation: scanLine 1.5s linear infinite;
              will-change: top;
            }
          `}
        </style>

        <div
          className="absolute inset-0 bg-gray-900/45 transition-opacity"
          onClick={handleClose}
        />

        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-center min-h-screen p-4">
          <div
            className={`relative w-[800px] bg-white/85 rounded-3xl shadow-2xl animate__animated animate__faster ${
              isClosing ? "animate__zoomOut" : "animate__zoomIn"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 rounded-t-2xl px-6 py-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-3xl text-white mr-3 animate-bounce">
                    qr_code_scanner
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      QR Code Scanner
                    </h2>
                    <p className="text-xs text-blue-100 mt-0.5 tracking-wide">
                      Scan QR code to find items
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="flex items-center p-2 rounded-lg bg-white/10 hover:bg-red-500 text-white transition-all duration-200 backdrop-blur-sm group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Camera View */}
            <div className="relative bg-gradient-to-b from-gray-50 to-white p-6 rounded-b-3xl">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{
                    facingMode: "user",
                    width: 1280,
                    height: 720,
                  }}
                />

                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">{scanningMessage}</p>
                    </div>
                  </div>
                )}

                {/* Scanning Frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Corner Lines */}
                    <div className="absolute top-0 left-0 w-8 h-8">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-600" />
                      <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-600" />
                    </div>
                    <div className="absolute top-0 right-0 w-8 h-8">
                      <div className="absolute top-0 right-0 w-full h-0.5 bg-blue-600" />
                      <div className="absolute top-0 right-0 w-0.5 h-full bg-blue-600" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-8 h-8">
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                      <div className="absolute bottom-0 left-0 w-0.5 h-full bg-blue-600" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8">
                      <div className="absolute bottom-0 right-0 w-full h-0.5 bg-blue-600" />
                      <div className="absolute bottom-0 right-0 w-0.5 h-full bg-blue-600" />
                    </div>

                    {/* Scanning Line */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="scanning-line" />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-0 right-0">
                    <p className="text-center text-white text-sm px-4 py-2 bg-black/50 rounded-full mx-auto w-max">
                      {scanningMessage || "วาง QR Code ในกรอบเพื่อสแกน"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scan Button */}
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 hover:from-blue-800 hover:via-blue-700 hover:to-blue-900 disabled:opacity-50 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
              >
                {isScanning ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
                {isScanning ? "กำลังสแกน..." : "สแกน QR Code"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div
          className={`md:hidden relative w-full h-full bg-white/85 animate__animated animate__faster ${
            isClosing ? "animate__slideOutDown" : "animate__slideInUp"
          }`}
        >
          {/* Mobile Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 px-4 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="material-symbols-outlined text-2xl text-white mr-3 animate-bounce">
                  qr_code_scanner
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    QR Scanner
                  </h2>
                  <p className="text-xs text-blue-100 mt-0.5 tracking-wide">
                    Scan to find items
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="flex p-2.5 bg-white/10 hover:bg-red-600/90 rounded-xl transition-all duration-200 hover:shadow-lg group"
              >
                <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Mobile Camera View */}
          <div className="flex-1 relative h-[calc(100%-64px)]">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{
                facingMode: "environment",
                width: window.innerWidth,
                height: window.innerHeight,
              }}
            />

            {/* Mobile Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">{scanningMessage}</p>
                </div>
              </div>
            )}

            {/* Mobile Scanning Frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Corner Lines */}
                <div className="absolute top-0 left-0 w-8 h-8">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-600" />
                  <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-600" />
                </div>
                <div className="absolute top-0 right-0 w-8 h-8">
                  <div className="absolute top-0 right-0 w-full h-0.5 bg-blue-600" />
                  <div className="absolute top-0 right-0 w-0.5 h-full bg-blue-600" />
                </div>
                <div className="absolute bottom-0 left-0 w-8 h-8">
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                  <div className="absolute bottom-0 left-0 w-0.5 h-full bg-blue-600" />
                </div>
                {/* Corner Lines (continued) */}
                <div className="absolute bottom-0 right-0 w-8 h-8">
                  <div className="absolute bottom-0 right-0 w-full h-0.5 bg-blue-600" />
                  <div className="absolute bottom-0 right-0 w-0.5 h-full bg-blue-600" />
                </div>

                {/* Scanning Line */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="scanning-line" />
                </div>
              </div>

              {/* Mobile Status Text */}
              <div className="absolute bottom-36 left-0 right-0">
                <p className="text-center text-white text-sm px-4 py-2 bg-black/50 rounded-full mx-auto w-max">
                  {scanningMessage || "วาง QR Code ในกรอบเพื่อสแกน"}
                </p>
              </div>

              {/* Mobile Scan Button */}
              <div className="absolute bottom-8 left-4 right-4">
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 hover:from-blue-800 hover:via-blue-700 hover:to-blue-900 disabled:opacity-50 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
                >
                  {isScanning ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                  {isScanning ? "กำลังสแกน..." : "สแกน QR Code"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Popup */}
      {showDetailPopup && selectedBill && (
        <BillDetailPopup bill={selectedBill} onClose={handleCloseDetail} />
      )}
    </>
  );
};

export default ScanQrCodePopup;
