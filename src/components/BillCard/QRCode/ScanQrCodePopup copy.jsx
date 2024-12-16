import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import BillDetailPopup from "../Table/view/BillDetail/BillDetailPopup";
import { Camera, X, Loader2, RotateCw } from "lucide-react";

const ScanQrCodePopup = ({ isOpen, onClose, onSearch, bills }) => {
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMessage, setScanningMessage] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const webcamRef = useRef(null);

  // ตรวจสอบว่าเป็นอุปกรณ์ mobile หรือไม่
  useEffect(() => {
    const checkMobileDevice = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobileDevice(isMobile);
    };

    // ตรวจสอบว่ามีกล้องหลายตัวหรือไม่
    const checkAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(cameras.length > 1);
      } catch (error) {
        console.error('Error checking cameras:', error);
        setHasMultipleCameras(false);
      }
    };

    checkMobileDevice();
    checkAvailableCameras();
  }, []);

  const toggleCamera = () => {
    setFacingMode((prevMode) =>
      prevMode === "environment" ? "user" : "environment"
    );
  };

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
          const cleanDescription = (str) => str?.toString().trim().toLowerCase();
  
          return (
            cleanPartNumber(bill.M_PART_NUMBER) === cleanPartNumber(qrData.partNumber) ||
            cleanDescription(bill.M_PART_DESCRIPTION) === cleanDescription(qrData.partDescription)
          );
        });
  
        if (foundBill) {
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
  
          // เก็บ bill ที่เจอไว้ใน state ก่อน
          setSelectedBill(foundBill);
          setShowDetailPopup(true);  // เปิด detail popup ก่อน
          
          // จากนั้นค่อยปิด scanner
          setIsClosing(true);
          setTimeout(() => {
            onClose();
            setIsClosing(false);
          }, 500);
  
        } else {
          alert(
            "ไม่พบข้อมูล Bill ที่ตรงกับ QR Code\n\n" +
            "ข้อมูลที่สแกนได้:\n" +
            `Part Number: ${qrData.partNumber}`
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

            @keyframes zoomIn {
              from {
                opacity: 0;
                transform: scale3d(0.3, 0.3, 0.3);
              }
              50% {
                opacity: 1;
              }
            }

            @keyframes zoomOut {
              from {
                opacity: 1;
              }
              50% {
                opacity: 0;
                transform: scale3d(0.3, 0.3, 0.3);
              }
              to {
                opacity: 0;
              }
            }

            .animate__zoomIn {
              animation: zoomIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .animate__zoomOut {
              animation: zoomOut 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
          `}
        </style>

        <div 
          className="absolute inset-0 bg-gray-900/45 transition-opacity" 
          onClick={handleClose}
        />

        <div className="fixed inset-0 w-full h-full bg-black">
          <div className="w-full h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 px-4 py-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-2xl md:text-3xl text-white mr-3 animate-bounce">
                    qr_code_scanner
                  </span>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                      QR Scanner
                    </h2>
                    <p className="text-xs text-blue-100 mt-0.5 tracking-wide">
                      {isMobileDevice 
                        ? "กดปุ่มด้านล่างเพื่อสแกน" 
                        : "วาง QR Code ในกรอบเพื่อสแกน"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isMobileDevice && hasMultipleCameras && (
                    <button
                      onClick={toggleCamera}
                      className="flex items-center px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="flex items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-red-500 text-white transition-all duration-200 group"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            </div>

            {/* Camera View */}
            <div className="relative h-[calc(100vh-64px)]">
              <div className="relative h-full w-full">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{
                    facingMode: facingMode,
                    width: { ideal: isMobileDevice ? 1280 : 1920 },
                    height: { ideal: isMobileDevice ? 720 : 1080 },
                  }}
                />

                {/* Scanning Frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`relative ${isMobileDevice ? 'w-64 h-64' : 'w-96 h-96'}`}>
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

                  {/* Scan Message */}
                  <div className={`absolute ${isMobileDevice ? 'bottom-36' : 'bottom-24'} left-0 right-0`}>
                    <p className="text-center text-white text-sm px-4 py-2 bg-black/50 rounded-full mx-auto w-max">
                      {scanningMessage || "วาง QR Code ในกรอบเพื่อสแกน"}
                    </p>
                  </div>
                </div>

                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">{scanningMessage}</p>
                    </div>
                  </div>
                )}

                {/* Scan Button */}
                <div className={`absolute ${isMobileDevice ? 'bottom-8' : 'bottom-12'} left-4 right-4 md:left-1/4 md:right-1/4`}>
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 hover:from-indigo-600 hover:via-blue-700 hover:to-blue-900 disabled:opacity-50 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
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
      </div>

      {/* Detail Popup */}
      {showDetailPopup && selectedBill && (
        <BillDetailPopup bill={selectedBill} onClose={handleCloseDetail} />
      )}
    </>
  );
};

export default ScanQrCodePopup;