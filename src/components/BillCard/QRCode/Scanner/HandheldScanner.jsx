import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import BillDetailPopup from "../../Table/view/BillDetail/BillDetailPopup";
import { billCardService } from "../../../../services/billCardService";
import { directAccessService } from "../../../../services/directAccessService";

const HandheldScanner = ({
  isOpen,
  onClose,
  bills,
  onSelectSubInv,
  selectedSubInv,
}) => {
  // States
  const [scannedData, setScannedData] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMessage, setScanningMessage] = useState("");
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isChangingSubInv, setIsChangingSubInv] = useState(false);
  const [isScanButtonActive, setIsScanButtonActive] = useState(false);
  const [previousBills, setPreviousBills] = useState(bills);
  const [autoSubmit, setAutoSubmit] = useState(true); // เพิ่ม state สำหรับการส่งอัตโนมัติ

  // Refs
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const latestQrData = useRef(null);

  // Debug log bills data
  useEffect(() => {
    console.log("HandheldScanner props:", {
      onSelectSubInv: typeof onSelectSubInv,
      selectedSubInv,
      isChangingSubInv,
      billsChanged: bills !== previousBills,
    });
    
    console.log('Bills Data:', bills?.map(bill => ({
      id: bill.inventory_item_id,
      partNo: bill.M_PART_NUMBER,
      subInv: bill.M_SUBINV
    })));
  }, [onSelectSubInv, selectedSubInv, isChangingSubInv, bills, previousBills]);

  // Validate QR data
  const validateQrData = (data) => {
    try {
      console.log("Raw data from scanner:", data);
      
      // ถ้าไม่มีข้อมูลหรือเป็นสตริงว่าง
      if (!data || (typeof data === 'string' && data.trim() === '')) {
        throw new Error('ไม่พบข้อมูลจากการสแกน');
      }
      
      let partNumber = null;
      let subinventory = selectedSubInv || null;
      let inventory_item_id = null;
      
      // กรณีที่ 1: ข้อมูลเป็น JSON
      if (typeof data === 'string' && (data.startsWith('{') || data.includes('":"'))) {
        try {
          const parsedData = JSON.parse(data);
          console.log('Parsed JSON data:', parsedData);
          
          partNumber = parsedData.partNumber || null;
          subinventory = parsedData.subinventory || selectedSubInv || null;
          inventory_item_id = parsedData.inventory_item_id || null;
        } catch (jsonError) {
          console.log("Failed to parse as JSON, treating as plain text:", jsonError);
        }
      }
      
      // กรณีที่ 2: ข้อมูลไม่ใช่ JSON หรือแปลง JSON ไม่ได้
      if (!partNumber && !inventory_item_id) {
        // ให้ถือว่าข้อมูลทั้งหมดเป็น part number
        partNumber = data.toString().trim();
        console.log("Treating input as direct part number:", partNumber);
      }
      
      // ถ้ายังไม่มีข้อมูลใดๆ ให้แจ้งข้อผิดพลาด
      if (!partNumber && !inventory_item_id) {
        throw new Error('ไม่สามารถระบุรหัสชิ้นส่วนหรือรหัสสินค้าได้');
      }
      
      return {
        partNumber,
        subinventory,
        inventory_item_id,
        rawData: data // เก็บข้อมูลดิบไว้ด้วย
      };
    } catch (error) {
      console.error('QR Data validation error:', error);
      throw error;
    }
  };

  // Process scanned data
  const processScannedData = async (input) => {
    if (!input) {
      console.log("No input data to process");
      return;
    }
    
    try {
      setIsScanning(true);
      setScanningMessage("กำลังประมวลผลข้อมูล...");
      console.log("Raw input data:", input);

      // แสดงข้อมูลที่สแกนได้ทันทีเพื่อตรวจสอบ
      const debugMsg = `ข้อมูลที่สแกนได้: ${typeof input === 'string' ? input : JSON.stringify(input)}`;
      console.log(debugMsg);
      
      // Parse QR data
      let qrData;
      try {
        qrData = validateQrData(input);
        console.log('Validated QR Data:', qrData);
        latestQrData.current = qrData;
      } catch (parseError) {
        // ถ้าแปลงไม่ได้ ให้ใช้ข้อมูลดิบทั้งหมดเป็น itemId
        console.log("QR Parse error, using raw input:", parseError);
        qrData = {
          partNumber: input.toString().trim(),
          subinventory: selectedSubInv,
          inventory_item_id: input.toString().trim()
        };
        latestQrData.current = qrData;
      }
      
      // ถ้า subinventory ไม่ตรงกับที่เลือกไว้ ให้ถามผู้ใช้
      if (qrData.subinventory && qrData.subinventory !== selectedSubInv) {
        console.log("Different subinventory detected:", qrData.subinventory);
        const willChange = await Swal.fire({
          title: "พบข้อมูลจาก Subinventory อื่น",
          html: `Part Number นี้อยู่ใน ${qrData.subinventory}<br>ต้องการเปลี่ยน Subinventory หรือไม่?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "เปลี่ยน",
          cancelButtonText: "ยกเลิก",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
        });

        if (willChange.isConfirmed) {
          setIsChangingSubInv(true);
          setPreviousBills(bills);
          setScanningMessage(`กำลังเปลี่ยน Subinventory เป็น ${qrData.subinventory}...`);
          await onSelectSubInv(qrData.subinventory);
        }
      }
      
      // เรียกข้อมูลโดยตรงจาก API เหมือนเว็บ
      console.log(`Fetching direct data: subinv=${qrData.subinventory || selectedSubInv}, id=${qrData.inventory_item_id || qrData.partNumber}`);
      const billDetails = await directAccessService.getBillCards(
        qrData.subinventory || selectedSubInv,
        qrData.inventory_item_id || qrData.partNumber
      );

      if (billDetails && billDetails.length > 0) {
        console.log("Found bill details:", billDetails.length, "records");
        const sortedBills = [...billDetails].sort((a, b) => {
          return new Date(b.M_DATE || 0) - new Date(a.M_DATE || 0);
        });

        // ตรวจสอบว่าเป็นข้อมูลออฟไลน์หรือไม่
        const isOfflineData = billDetails[0]?._isOfflineData;

        const billData = {
          ...sortedBills[0],
          allRelatedBills: sortedBills,
          relatedBills: sortedBills,
          totalQty: billDetails.reduce(
            (sum, bill) => sum + Number(bill.M_QTY || 0),
            0
          ),
          billCount: billDetails.length,
          latestDate: new Date(sortedBills[0].M_DATE || new Date()),
          _isOfflineData: isOfflineData
        };

        if (navigator.vibrate) navigator.vibrate(200);
        setScanningMessage(isOfflineData 
          ? "พบข้อมูลแต่ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้" 
          : "พบข้อมูล! กำลังแสดงรายละเอียด..."
        );

        console.log('Setting selected bill:', billData);
        await new Promise(resolve => {
          setSelectedBill(billData);
          setTimeout(resolve, 500);
        });

        setShowDetailPopup(true);
        console.log("Popup visibility set to:", true);

        if (isOfflineData) {
          setTimeout(() => {
            Swal.fire({
              title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
              text: 'แสดงข้อมูลเท่าที่มี อาจไม่ครบถ้วน',
              icon: 'warning',
              confirmButtonText: 'ตกลง'
            });
          }, 1000);
        }
      } else {
        // แก้ไขส่วนนี้สำหรับกรณีไม่มีข้อมูล
        console.log("No bill details found, creating empty bill structure");
        
        // สร้างข้อมูล bill data แบบว่างสำหรับแสดง popup
        const emptyBillData = {
          M_PART_NUMBER: qrData.partNumber || input.toString().trim(),
          M_PART_DESCRIPTION: typeof qrData.description === 'string' ? 
            qrData.description : 
            (qrData.partNumber ? `Description for ${qrData.partNumber}` : ''),
          M_SUBINV: qrData.subinventory || selectedSubInv,
          M_DATE: new Date().toISOString(),
          M_QTY: "0",
          begin_qty: "0",
          M_ID: "-",
          TRANSACTION_TYPE_NAME: "-",
          M_USER_NAME: "-",
          inventory_item_id: qrData.inventory_item_id || "",
          // เพิ่ม properties เพื่อให้รองรับการแสดงผลในหน้า detail
          relatedBills: [],
          allRelatedBills: [],
          totalQty: 0,
          billCount: 0,
          latestDate: new Date(),
          _isEmptyData: true  // เพิ่ม flag เพื่อระบุว่าเป็นข้อมูลว่างเปล่า
        };

        // แสดงข้อมูลแบบ debug
        console.log("Created empty bill data:", emptyBillData);
        if (navigator.vibrate) navigator.vibrate(200);

        // ตั้งค่า selected bill และแสดง popup แม้จะไม่มีข้อมูล
        await new Promise(resolve => {
          setSelectedBill(emptyBillData);
          setTimeout(resolve, 500);
        });
        
        setShowDetailPopup(true);
        console.log("Popup visibility set to true for empty data");
        
        // แสดง toast แจ้งเตือนเล็กน้อยว่าไม่พบข้อมูล (ไม่ต้องใช้ full alert)
        setTimeout(() => {
          Swal.fire({
            title: 'ไม่พบข้อมูล',
            text: 'ไม่พบข้อมูลการเคลื่อนไหวของสินค้า',
            icon: 'info',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Scanning error:", error);
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        html: `ไม่สามารถประมวลผลข้อมูลได้<br><br>
              <strong>สาเหตุ:</strong> ${error.message}<br>
              <strong>ข้อมูลที่สแกน:</strong> ${input}`,
        icon: "error",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      if (!showDetailPopup && !isChangingSubInv) {
        setIsScanning(false);
        setScanningMessage("พร้อมสแกน QR Code");
      }
    }
  };

  // Handle scanner input - ปรับปรุงให้ทำงานโดยอัตโนมัติ
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen || !isScanButtonActive) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);

      // ยังรองรับการกด Enter (เพื่อความเข้ากันได้กับระบบเดิม)
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        console.log("Enter key detected, processing buffer:", bufferRef.current);
        if (bufferRef.current) {
          processScannedData(bufferRef.current);
          bufferRef.current = '';
        }
        return;
      }

      if (/[\w\d\-_.:{}[\]"']/.test(e.key)) {
        bufferRef.current += e.key;
        console.log("Buffer updated:", bufferRef.current);

        // ถ้าเปิดใช้งานการส่งอัตโนมัติ ให้ตรวจสอบรูปแบบข้อมูล
        if (autoSubmit) {
          // ตรวจสอบเงื่อนไขสำหรับส่งอัตโนมัติ
          // 1. มีรูปแบบเป็น JSON
          // 2. หรือมีความยาวมากพอที่จะเป็นข้อมูลที่สแกนได้
          if (
            (bufferRef.current.includes('{') && bufferRef.current.includes('}')) || 
            (bufferRef.current.length >= 10 && !isScanning)  // สำหรับรหัสสินค้า 10 ตัวอักษรขึ้นไป
          ) {
            console.log("Auto-submit detected, processing data:", bufferRef.current);
            processScannedData(bufferRef.current);
            bufferRef.current = '';
            return;
          }
        }

        // ยังคงใช้ timeout เป็น fallback
        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current) {
            console.log("Processing buffer after timeout:", bufferRef.current);
            processScannedData(bufferRef.current);
            bufferRef.current = '';
          }
        }, 100);

        scanTimeoutRef.current = setTimeout(() => {
          bufferRef.current = '';
          setIsScanButtonActive(false);
          setScanningMessage("กดปุ่มสแกนอีกครั้งเพื่อสแกนใหม่");
        }, 5000);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, [isOpen, isScanButtonActive, isScanning, autoSubmit]);

  // Effect to handle bills update after subinventory change
  useEffect(() => {
    const handleBillsUpdate = async () => {
      if (isChangingSubInv && bills !== previousBills && latestQrData.current) {
        try {
          console.log(
            "Attempting auto rescan with data:",
            latestQrData.current
          );
          setScanningMessage("กำลังค้นหาข้อมูลใน Subinventory ใหม่...");
          setIsScanning(true);

          // รอให้ข้อมูลอัพเดทเสร็จ
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // ใช้ directAccessService แทน findMatchingBill
          const billDetails = await directAccessService.getBillCards(
            selectedSubInv,
            latestQrData.current.inventory_item_id || latestQrData.current.partNumber
          );

          if (billDetails && billDetails.length > 0) {
            console.log("Found bill after subinventory change:", billDetails.length, "records");
            if (navigator.vibrate) navigator.vibrate(200);
            setScanningMessage("พบข้อมูล! กำลังแสดงรายละเอียด...");

            const sortedBills = [...billDetails].sort((a, b) => {
              return new Date(b.M_DATE || 0) - new Date(a.M_DATE || 0);
            });

            const billData = {
              ...sortedBills[0],
              allRelatedBills: sortedBills,
              relatedBills: sortedBills,
              totalQty: billDetails.reduce(
                (sum, bill) => sum + Number(bill.M_QTY || 0),
                0
              ),
              billCount: billDetails.length,
              latestDate: new Date(sortedBills[0].M_DATE || new Date())
            };

            await new Promise(resolve => {
              setSelectedBill(billData);
              setTimeout(resolve, 500);
            });

            setShowDetailPopup(true);
          } else {
            console.log("No matching bill found in new subinventory");
            await Swal.fire({
              title: "ไม่พบข้อมูล",
              html: `ไม่พบข้อมูล Bill ที่ตรงกับ QR Code ใน Subinventory ใหม่<br><br>
                     <strong>ข้อมูลที่สแกนได้:</strong><br>
                     Part Number: ${
                       latestQrData.current.partNumber || "ไม่พบข้อมูล"
                     }<br>
                     Subinventory ใหม่: ${selectedSubInv || "ไม่พบข้อมูล"}`,
              icon: "warning",
              confirmButtonText: "ตกลง",
              confirmButtonColor: "#3085d6",
            });
          }
        } catch (error) {
          console.error("Auto rescan error:", error);
          await Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: `ไม่สามารถค้นหาข้อมูลได้: ${error.message}`,
            icon: "error",
            confirmButtonText: "ตกลง",
            confirmButtonColor: "#3085d6",
          });
        } finally {
          setIsScanning(false);
          setIsChangingSubInv(false);
          if (!showDetailPopup) {
            setScanningMessage("พร้อมสแกน QR Code");
          }
        }
      }
    };

    handleBillsUpdate();
  }, [bills, previousBills, isChangingSubInv, selectedSubInv, showDetailPopup]);

  // Handle scan button
  const handleScanButtonPress = () => {
    setIsScanButtonActive(true);
    if (navigator.vibrate) navigator.vibrate(200);
    setScanningMessage("พร้อมรับข้อมูลสแกน (โปรดสแกน QR Code)");
    
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }

    setTimeout(() => {
      if (!showDetailPopup && isScanButtonActive) {
        setIsScanButtonActive(false);
        setScanningMessage("กดปุ่มสแกนอีกครั้งเพื่อสแกนใหม่");
      }
    }, 30000); // timeout หลังจาก 30 วินาที
  };

  // Clean up when component unmounts or closes
  useEffect(() => {
    if (!isOpen) {
      setShowDetailPopup(false);
      setSelectedBill(null);
      setIsChangingSubInv(false);
      setPreviousBills(bills);
      latestQrData.current = null;
    }
  }, [isOpen, bills]);

  // Handle closing
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setShowDetailPopup(false);
      setSelectedBill(null);
      setScannedData("");
      bufferRef.current = '';
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    }, 300);
  };

  const handleCloseDetail = () => {
    console.log("Closing detail popup");
    setShowDetailPopup(false);
    setSelectedBill(null);
    setScannedData("");
    onClose();
  };

  if (!isOpen && !showDetailPopup) return null;

  console.log("Render state:", { isOpen, showDetailPopup, selectedBill: !!selectedBill });

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-gray-900/45 transition-opacity"
          onClick={handleClose}
        />

        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className={`relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate__animated animate__faster ${
              isClosing ? "animate__zoomOut" : "animate__zoomIn"
            }`}
          >
            {/* Hidden input for scanner - ปรับปรุงให้ทำงานอัตโนมัติ */}
            <input
              ref={hiddenInputRef}
              type="text"
              className="opacity-0 h-0 w-0 absolute"
              autoComplete="off"
              onChange={(e) => {
                // ถ้าเปิดใช้งานการส่งอัตโนมัติ และข้อมูลมีความยาวพอ
                if (autoSubmit && e.target.value && e.target.value.length >= 5) {
                  const scannedValue = e.target.value;
                  console.log("Hidden input auto-processing:", scannedValue);
                  processScannedData(scannedValue);
                  e.target.value = '';
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const scannedValue = e.target.value;
                  console.log("Hidden input value from Enter:", scannedValue);
                  processScannedData(scannedValue);
                  e.target.value = '';
                }
              }}
            />

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-2xl text-white mr-3">
                    qr_code_scanner
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Handheld Scanner
                    </h2>
                    <p className="text-xs text-blue-100 mt-0.5">
                      ใช้เครื่องสแกนเพื่อค้นหาข้อมูล
                    </p>
                  </div>
                </div>
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

            {/* Content */}
            <div className="p-6">
              <div className="text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center
                  ${isScanning ? 'bg-blue-100 animate-pulse' : 'bg-blue-50'}`}>
                  <span className={`material-symbols-outlined text-3xl text-blue-600
                    ${isScanning ? 'animate-spin' : ''}`}>
                    {isScanning ? "hourglass_top" : "qr_code_scanner"}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isScanning ? "กำลังประมวลผล" : "พร้อมรับข้อมูล"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {scanningMessage ||
                      "กรุณากดปุ่มสแกนเพื่อเริ่มต้นการสแกน QR Code หรือ Barcode"}
                  </p>
                </div>

                {isScanning && (
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}

                {/* ตัวเลือกการส่งอัตโนมัติ */}
                {/* <div className="pt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={autoSubmit}
                      onChange={(e) => setAutoSubmit(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">ส่งข้อมูลอัตโนมัติ (ไม่ต้องกด Enter)</span>
                  </label>
                </div> */}

                {/* Scan Button */}
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={handleScanButtonPress}
                    disabled={isScanning}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                      ${isScanButtonActive 
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-600'} 
                      transition-all duration-200 hover:shadow-lg
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      qr_code_scanner
                    </span>
                    <span className="font-medium">
                      {isScanButtonActive ? 'กำลังสแกน...' : 'เริ่มสแกน'}
                    </span>
                  </button>
                </div>

                <div className="pt-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700">
                      {autoSubmit 
                        ? "กดปุ่มสแกนและใช้เครื่องสแกน QR Code ระบบจะประมวลผลโดยอัตโนมัติ ไม่ต้องกด Enter" 
                        : "กดปุ่มสแกนและใช้เครื่องสแกน QR Code จากนั้นกด Enter เพื่อส่งข้อมูล"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Detail Popup */}
      {showDetailPopup && selectedBill && (
        <div className="fixed inset-0 z-[60]">
          {console.log("Rendering BillDetailPopup with bill:", selectedBill)}
          <BillDetailPopup 
            bill={selectedBill} 
            onClose={handleCloseDetail} 
          />
        </div>
      )}
    </>
  );
};

export default HandheldScanner;