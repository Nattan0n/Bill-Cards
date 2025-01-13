// components/BillCard/QRCode/ScanQrCodePopup.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import BillDetailPopup from "../Table/view/BillDetail/BillDetailPopup";
import { Camera, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import { 
  parseDate, 
  getLatestMonthAndYear, 
  isDateInRange,
  filterBillsByDateRange,
  groupBillsByPartNumber 
} from "../../../utils/dateUtils";
import { useBillFilter } from "../../../hook/useBillFilter";

const ScanQrCodePopup = ({ isOpen, onClose, onSearch, bills }) => {
  // Camera states
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  
  // UI states
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMessage, setScanningMessage] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  
  // Refs
  const webcamRef = useRef(null);

  // Get latest month/year and filtered bills
  const latestDateRange = useMemo(() => getLatestMonthAndYear(bills), [bills]);
  
  // Use bill filter hook with latest month
  const filteredBills = useBillFilter(bills, "", { 
    startDate: latestDateRange?.startDate,
    endDate: latestDateRange?.endDate
  });

  // Group filtered bills by part number
  const groupedBills = useMemo(() => {
    if (!latestDateRange) return [];
    
    // First filter by date range
    const dateFilteredBills = filterBillsByDateRange(bills, latestDateRange);
    
    // Then group the filtered bills
    return groupBillsByPartNumber(dateFilteredBills, latestDateRange);
  }, [bills, latestDateRange]);

  // Request camera permission when component mounts
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        setHasPermission(true);
        setPermissionError(null);
        
        // Stop the stream to let Webcam component take over
        stream.getTracks().forEach(track => track.stop());

      } catch (err) {
        console.error('Camera permission error:', err);
        setPermissionError(err.message);
        setHasPermission(false);
        
        let errorMessage = "ไม่สามารถเข้าถึงกล้องได้";
        if (err.name === "NotAllowedError") {
          errorMessage = "กรุณาอนุญาตการใช้งานกล้องในการตั้งค่าเบราว์เซอร์";
        } else if (err.name === "NotFoundError") {
          errorMessage = "ไม่พบกล้องในอุปกรณ์ของคุณ";
        }
        
        Swal.fire({
          title: "ไม่สามารถใช้งานกล้องได้",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#3085d6"
        });
      }
    };

    if (isOpen) {
      requestCameraPermission();
    }

    return () => {
      // Cleanup
      if (webcamRef.current && webcamRef.current.stream) {
        webcamRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Reset states when component mounts/unmounts
  useEffect(() => {
    if (!isOpen) {
      setShowDetailPopup(false);
      setSelectedBill(null);
      setShowScanner(true);
      setIsCameraReady(false);
    }
  }, [isOpen]);

  // Handle camera ready state
  const handleUserMedia = () => {
    setIsCameraReady(true);
    setScanningMessage("พร้อมสแกน QR Code");
  };

  // Find matching bill from QR data
  const findMatchingBill = (qrData) => {
    if (!qrData?.partNumber) return null;

    const qrPartNumber = String(qrData.partNumber).trim().toLowerCase();
    
    return groupedBills.find(group => {
      const billPartNumber = String(group?.M_PART_NUMBER || "").trim().toLowerCase();
      return billPartNumber === qrPartNumber;
    });
  };

  // Handle QR code scanning
  const handleScan = async () => {
    if (!webcamRef.current || !hasPermission || !isCameraReady) return;
    
    try {
      setIsScanning(true);
      setScanningMessage("กำลังสแกน QR Code...");

      // Get screenshot from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error("ไม่สามารถถ่ายภาพได้");

      // Create image from screenshot
      const img = new Image();
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(() => reject(new Error("หมดเวลาในการโหลดภาพ")), 3000);
      });

      // Process image
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

      let qrData;
      try {
        qrData = JSON.parse(code.data);
        console.log("Scanned QR Data:", qrData);
      } catch (error) {
        throw new Error("QR Code ไม่ถูกต้อง");
      }

      const foundBill = findMatchingBill(qrData);

      if (foundBill) {
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        
        setSelectedBill({
          ...foundBill,
          dateRange: latestDateRange
        });
        setShowDetailPopup(true);
        setScanningMessage("พบข้อมูล Bill แล้ว");
        setShowScanner(false);
      } else {
        await Swal.fire({
          title: "ไม่พบข้อมูล",
          html: `ไม่พบข้อมูล Bill ที่ตรงกับ QR Code<br><br>
                 <strong>ข้อมูลที่สแกนได้:</strong><br>
                 Part Number: ${qrData.partNumber || 'ไม่พบข้อมูล'}`,
          icon: "warning",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#3085d6"
        });
      }
    } catch (error) {
      console.error("Scanning error:", error);
      setScanningMessage(`เกิดข้อผิดพลาด: ${error.message}`);
      setTimeout(() => setScanningMessage(""), 2000);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle flip camera (for devices with multiple cameras)
  const handleFlipCamera = () => {
    setFacingMode(current => current === "user" ? "environment" : "user");
  };

  // Handle close popup
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (!showDetailPopup) {
        onClose();
      }
      setShowScanner(false);
      setIsClosing(false);
    }, 500);
  };

  // Handle close detail popup
  const handleCloseDetail = () => {
    console.log("Closing detail popup");
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

        {/* Main Container */}
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className={`relative w-full max-w-[800px] h-[calc(100vh-2rem)] md:h-auto bg-white/85 rounded-3xl shadow-2xl overflow-hidden animate__animated animate__faster ${
            isClosing ? "animate__zoomOut" : "animate__zoomIn"
          }`}>
            
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
                      Scan to find items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFlipCamera}
                    className="flex items-center px-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined">flip_camera_ios</span>
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

            {/* Camera View */}
            <div className="relative h-[calc(100%-64px)] md:h-auto md:aspect-video p-0 md:p-6">
              <div className="relative h-full md:rounded-2xl md:shadow-lg overflow-hidden">
                {hasPermission ? (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{
                      facingMode,
                      width: { ideal: 1280 },
                      height: { ideal: 720 }
                    }}
                    onUserMedia={handleUserMedia}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center p-4">
                      <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                        no_photography
                      </span>
                      <p className="text-gray-600">{permissionError || 'กำลังขอสิทธิ์การใช้งานกล้อง...'}</p>
                    </div>
                  </div>
                )}

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
                  <div className="relative w-48 md:w-64 h-48 md:h-64">
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

                  <div className="absolute bottom-36 md:bottom-4 left-0 right-0">
                    <p className="text-center text-white text-sm px-4 py-2 bg-black/50 rounded-full mx-auto w-max">
                      {scanningMessage || "วาง QR Code ในกรอบเพื่อสแกน"}
                    </p>
                  </div>
                </div>

                {/* Scan Button */}
                <div className="fixed bottom-20 left-4 right-4 md:absolute md:bottom-4">
                  <button
                    onClick={handleScan}
                    disabled={isScanning || !hasPermission || !isCameraReady}
                    className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 hover:from-blue-800 hover:via-blue-700 hover:to-blue-900 disabled:opacity-50 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
                  >
                    {isScanning ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                    {isScanning ? "กำลังสแกน..." : 
                     !hasPermission ? "รอการอนุญาตใช้กล้อง..." :
                     !isCameraReady ? "กำลังเตรียมกล้อง..." :
                     "สแกน QR Code"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Detail Popup */}
      {showDetailPopup && selectedBill && (
        <BillDetailPopup
          bill={selectedBill}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
};

export default ScanQrCodePopup;