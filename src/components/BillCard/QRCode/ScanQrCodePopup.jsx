// components/BillCard/QRCode/ScanQrCodePopup.jsx
import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import BillDetailPopup from "../Table/view/BillDetail/BillDetailPopup";
import { Camera, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

const ScanQrCodePopup = ({ isOpen, onClose, bills, onSelectSubInv, selectedSubInv }) => {
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
  
  // Data states
  const [isChangingSubInv, setIsChangingSubInv] = useState(false);
  const [previousBills, setPreviousBills] = useState(bills);
  const latestQrData = useRef(null);
  
  // Refs
  const webcamRef = useRef(null);

  // Effect to handle bills update after subinventory change
  useEffect(() => {
    const handleBillsUpdate = async () => {
      if (isChangingSubInv && bills !== previousBills && latestQrData.current) {
        await handleRescan();
      }
    };
    handleBillsUpdate();
  }, [bills, previousBills, isChangingSubInv]);

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
      if (webcamRef.current?.stream) {
        webcamRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Reset states when component unmounts
  useEffect(() => {
    if (!isOpen) {
      setShowDetailPopup(false);
      setSelectedBill(null);
      setShowScanner(true);
      setIsCameraReady(false);
      setIsChangingSubInv(false);
      setPreviousBills(bills);
      latestQrData.current = null;
    }
  }, [isOpen, bills]);

  // Handle camera ready state
  const handleUserMedia = () => {
    setIsCameraReady(true);
    setScanningMessage("พร้อมสแกน QR Code");
  };

  // Find matching bill from QR data with improved matching
  const findMatchingBill = (qrData) => {
    if (!qrData?.partNumber || !bills) return null;

    const qrPartNumber = String(qrData.partNumber).trim().toLowerCase();
    
    // Find all matching bills
    const matchingBills = bills.filter(bill => {
      const billPartNumber = String(bill?.M_PART_NUMBER || "").trim().toLowerCase();
      return billPartNumber === qrPartNumber;
    });

    if (!matchingBills.length) return null;

    // Sort bills by date descending
    const sortedBills = matchingBills.sort((a, b) => {
      return new Date(b.M_DATE) - new Date(a.M_DATE);
    });

    // Calculate total quantities
    const totalQty = matchingBills.reduce((sum, bill) => sum + Number(bill.M_QTY || 0), 0);

    // Return formatted data structure
    return {
      ...sortedBills[0],
      allRelatedBills: sortedBills,
      relatedBills: sortedBills,
      totalQty,
      billCount: matchingBills.length,
      latestDate: new Date(sortedBills[0].M_DATE)
    };
  };

  // Handle rescanning after subinventory change
  const handleRescan = async () => {
    if (!latestQrData.current) return;

    try {
      setScanningMessage("กำลังค้นหาข้อมูล...");
      setIsScanning(true);

      let attempts = 0;
      let foundBill = null;
      
      while (attempts < 10) {
        foundBill = findMatchingBill(latestQrData.current);
        
        if (foundBill) {
          console.log('Found bill on attempt:', attempts + 1, foundBill);
          break;
        }
        
        attempts++;
        setScanningMessage(`กำลังค้นหาข้อมูล... (พยายามครั้งที่ ${attempts}/10)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (foundBill) {
        if (navigator.vibrate) navigator.vibrate(200);
        setScanningMessage("พบข้อมูล! กำลังแสดงรายละเอียด...");

        // ทำให้แน่ใจว่า state ถูกอัปเดตตามลำดับ
        await new Promise(resolve => {
          setSelectedBill(foundBill);
          setShowScanner(false);
          setTimeout(resolve, 100);
        });

        setShowDetailPopup(true);
      } else {
        await Swal.fire({
          title: "ไม่พบข้อมูล",
          html: `ไม่พบข้อมูล Bill ที่ตรงกับ QR Code หลังจากลองค้นหาแล้ว ${attempts} ครั้ง<br><br>
                 <strong>ข้อมูลที่สแกนได้:</strong><br>
                 Part Number: ${latestQrData.current.partNumber || 'ไม่พบข้อมูล'}<br>
                 Subinventory จาก QR: ${latestQrData.current.subinventory || 'ไม่พบข้อมูล'}`,
          icon: "warning",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#3085d6"
        });
      }
    } catch (error) {
      console.error("Rescan error:", error);
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: `ไม่สามารถค้นหาข้อมูลได้: ${error.message}`,
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085d6"
      });
    } finally {
      if (!showDetailPopup) {
        setIsScanning(false);
        setIsChangingSubInv(false);
        setScanningMessage("พร้อมสแกน QR Code");
      }
    }
  };

  // Handle QR code scanning
  const handleScan = async () => {
    if (!webcamRef.current || !hasPermission || !isCameraReady || isChangingSubInv) return;
  
    try {
      setIsScanning(true);
      setScanningMessage("กำลังสแกน QR Code...");
  
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error("ไม่สามารถถ่ายภาพได้");
  
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(() => reject(new Error("หมดเวลาในการโหลดภาพ")), 3000);
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
        setTimeout(() => setScanningMessage("พร้อมสแกน QR Code"), 2000);
        return;
      }
  
      let qrData;
      try {
        qrData = JSON.parse(code.data);
      } catch (error) {
        throw new Error("QR Code ไม่ถูกต้อง");
      }
  
      const scannedSubInv = qrData.subinventory;
      const scannedPartNumber = qrData.partNumber;
  
      if (!scannedSubInv || !scannedPartNumber) {
        throw new Error("QR Code ไม่มีข้อมูลที่จำเป็น");
      }

      // Store the latest QR data
      latestQrData.current = qrData;
  
      // ค้นหา Part Number ในข้อมูลปัจจุบันก่อน
      let foundBill = findMatchingBill(qrData);
      
      // ถ้าไม่พบและ subinventory ไม่ตรงกับปัจจุบัน
      if (!foundBill && scannedSubInv !== selectedSubInv) {
        const willChange = await Swal.fire({
          title: "พบข้อมูลจาก Subinventory อื่น",
          html: `Part Number นี้อยู่ใน ${scannedSubInv}<br>ต้องการเปลี่ยน Subinventory หรือไม่?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "เปลี่ยน",
          cancelButtonText: "ยกเลิก",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33"
        });
  
        if (willChange.isConfirmed) {
          setIsChangingSubInv(true);
          setPreviousBills(bills);
          setScanningMessage(`กำลังเปลี่ยน Subinventory เป็น ${scannedSubInv}...`);
          await onSelectSubInv(scannedSubInv);
          return;
        }
      }
  
      if (foundBill) {
        if (navigator.vibrate) navigator.vibrate(200);
        setScanningMessage("พบข้อมูล! กำลังแสดงรายละเอียด...");
        
        // ทำให้แน่ใจว่า state ถูกอัปเดตตามลำดับ
        await new Promise(resolve => {
          setSelectedBill(foundBill);
          setShowScanner(false);
          setTimeout(resolve, 100);
        });

        setShowDetailPopup(true);
      } else {
        await Swal.fire({
          title: "ไม่พบข้อมูล",
          html: `ไม่พบข้อมูล Bill ที่ตรงกับ QR Code<br><br>
                 <strong>ข้อมูลที่สแกนได้:</strong><br>
                 Part Number: ${scannedPartNumber || 'ไม่พบข้อมูล'}<br>
                 Subinventory จาก QR: ${scannedSubInv || 'ไม่พบข้อมูล'}`,
          icon: "warning",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#3085d6"
        });
      }
    } catch (error) {
      console.error("Scanning error:", error);
      setScanningMessage(`เกิดข้อผิดพลาด: ${error.message}`);
      setTimeout(() => setScanningMessage("พร้อมสแกน QR Code"), 2000);
    } finally {
      if (!showDetailPopup) {
        setIsScanning(false);
      }
    }
  };

  const handleFlipCamera = () => {
    setFacingMode(current => current === "user" ? "environment" : "user");
  };

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

  const handleCloseDetail = () => {
    setShowDetailPopup(false);
    setSelectedBill(null);
    setShowScanner(true);
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

        <div className="flex items-center justify-center min-h-screen p-4">
          <div className={`relative w-full max-w-[800px] h-[calc(100vh-2rem)] md:h-auto bg-white/85 rounded-3xl shadow-2xl overflow-hidden animate__animated animate__faster ${
            isClosing ? "animate__zoomOut" : "animate__zoomIn"
          }`}>
            
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

                {isScanning && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white p-4">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">{scanningMessage}</p>
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 md:w-64 h-48 md:h-64">
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
        <div className="fixed inset-0 z-[60]">
          <BillDetailPopup
            bill={selectedBill}
            onClose={handleCloseDetail}
          />
        </div>
      )}
    </>
  );
};

export default ScanQrCodePopup;