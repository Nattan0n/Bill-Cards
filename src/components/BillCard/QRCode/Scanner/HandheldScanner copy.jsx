import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import BillDetailPopup from "../../Table/view/BillDetail/BillDetailPopup";
import { directAccessService } from "../../../../services/directAccessService";

const HandheldScanner = ({
  isOpen,
  onClose,
  bills,
  onSelectSubInv,
  selectedSubInv,
}) => {
  // States
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMessage, setScanningMessage] = useState("");
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isChangingSubInv, setIsChangingSubInv] = useState(false);
  const [isScanButtonActive, setIsScanButtonActive] = useState(false);
  const [previousBills, setPreviousBills] = useState(bills);
  const [zebraScanner, setZebraScanner] = useState(false);
  const [lastScan, setLastScan] = useState("");
  const [suppressErrors, setSuppressErrors] = useState(true);
  const [zebraConfig, setZebraConfig] = useState({
    minLength: 10,
    readTimeout: 60000,
    bufferTimeout: 500,
    enableTab: true,
    enableContinuous: true,
    jsonDetectionDelay: 300
  });

  // Refs
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const hiddenInputRef = useRef(null);
  const latestQrData = useRef(null);
  const scannerReadyRef = useRef(false);
  const consecutiveScansRef = useRef(0);
  const scannerConnectedRef = useRef(false);
  const scanStartTimeRef = useRef(null);
  const jsonCompleteRef = useRef(false);
  const typingSpeedRef = useRef([]);

  // ฟังก์ชันตรวจสอบว่าเป็นการสแกนหรือพิมพ์ธรรมดา
  const isHighSpeedInput = () => {
    if (!scanStartTimeRef.current || !typingSpeedRef.current.length) {
      return false;
    }
    
    // คำนวณความเร็วในการพิมพ์
    const elapsedTime = (Date.now() - scanStartTimeRef.current) / 1000; // เวลาที่ผ่านไป (วินาที)
    const charCount = bufferRef.current.length;
    
    if (elapsedTime < 0.1) return false; // เวลาผ่านไปน้อยเกินไป
    
    const typingSpeed = charCount / elapsedTime; // ตัวอักษรต่อวินาที
    
    // หากพิมพ์เร็วกว่า 10 ตัวอักษรต่อวินาที ถือว่าเป็นการสแกน
    return typingSpeed > 10;
  };

  // Validate QR data - แก้ไขการแยกแยะและจัดการกับข้อมูล JSON
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
      let jsonData = null;
      
      // ตรวจสอบว่าข้อมูลเป็น JSON หรือไม่
      if (typeof data === 'string' && data.trim().startsWith('{') && data.trim().endsWith('}')) {
        try {
          // วิธีที่ 1: ลองแปลง JSON โดยตรง
          jsonData = JSON.parse(data.trim());
          console.log("Successfully parsed JSON data:", jsonData);
        } catch (initialJsonError) {
          console.error("Initial JSON parse error:", initialJsonError);
          
          try {
            // วิธีที่ 2: แก้ไขปัญหาการเข้ารหัส UTF-8 สำหรับภาษาไทย
            // โดยใช้ Buffer แทนการใช้ escape/unescape ที่ deprecated แล้ว
            const sanitizedData = data.trim()
              .replace(/\\u[\dA-Fa-f]{4}/g, match => JSON.parse(`"${match}"`))
              .replace(/[\u0E00-\u0E7F]/g, char => char); // คงค่าภาษาไทยไว้
            
            jsonData = JSON.parse(sanitizedData);
            console.log("Successfully parsed sanitized JSON data:", jsonData);
          } catch (sanitizedJsonError) {
            console.error("Error parsing sanitized JSON:", sanitizedJsonError);
            
            // วิธีที่ 3: ถ้ายังไม่ได้ ลองดึงข้อมูลด้วย regex
            try {
              const partNumberMatch = data.match(/"partNumber"\s*:\s*"([^"]+)"/);
              const subinventoryMatch = data.match(/"subinventory"\s*:\s*"([^"]+)"/);
              const inventoryItemIdMatch = data.match(/"inventory_item_id"\s*:\s*"([^"]+)"/);
              
              if (partNumberMatch) partNumber = partNumberMatch[1];
              if (subinventoryMatch) subinventory = subinventoryMatch[1];
              if (inventoryItemIdMatch) inventory_item_id = inventoryItemIdMatch[1];
              
              console.log("Manually extracted data:", { partNumber, subinventory, inventory_item_id });
            } catch (regexError) {
              console.error("Regex extraction failed:", regexError);
            }
          }
        }
        
        // ดึงข้อมูลจาก JSON ที่แปลงสำเร็จ
        if (jsonData) {
          partNumber = jsonData.partNumber || jsonData.PartNumber || jsonData.PARTNUMBER;
          subinventory = jsonData.subinventory || jsonData.Subinventory || jsonData.SUBINVENTORY || selectedSubInv;
          inventory_item_id = jsonData.inventory_item_id || jsonData.Inventory_item_id || jsonData.INVENTORY_ITEM_ID;
          
          // ตรวจสอบว่ามีการเข้ารหัส Base64 สำหรับ subinventory หรือไม่
          if (jsonData.subinventory_encoded) {
            try {
              subinventory = decodeURIComponent(atob(jsonData.subinventory_encoded));
            } catch (b64Error) {
              console.error("Error decoding Base64 subinventory:", b64Error);
            }
          }
        }
      } else {
        // ถ้าไม่ใช่ JSON ใช้ข้อมูลเป็น part number โดยตรง
        partNumber = data.toString().trim();
        console.log("Treating input as direct part number:", partNumber);
      }
      
      // ถ้ายังไม่มีข้อมูลใด ๆ ให้แจ้งข้อผิดพลาด
      if (!partNumber && !inventory_item_id) {
        throw new Error('ไม่สามารถระบุรหัสชิ้นส่วนหรือรหัสสินค้าได้');
      }
      
      return {
        partNumber,
        subinventory,
        inventory_item_id,
        rawData: data,
        isZebraScanned: zebraScanner,
        jsonData
      };
    } catch (error) {
      console.error('QR Data validation error:', error);
      throw error;
    }
  };

  // Process scanned data - แก้ไขวิธีการประมวลผลข้อมูลและการเรียกใช้ API
  const processScannedData = async (input) => {
    if (!input) {
      console.log("No input data to process");
      return;
    }
    
    // ตรวจสอบว่าเป็นการพิมพ์ด้วยคีย์บอร์ดธรรมดาหรือไม่
    const isManualTyping = !zebraScanner && !isHighSpeedInput();
    
    // ถ้าเป็นการพิมพ์ธรรมดาให้ไม่ทำงาน
    if (isManualTyping) {
      setScanningMessage("โปรดใช้เครื่องสแกน QR Code เท่านั้น");
      bufferRef.current = "";
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = "";
      }
      return;
    }
    
    try {
      setIsScanning(true);
      setScanningMessage("กำลังประมวลผลข้อมูล...");
      console.log("Processing input data:", input);

      // บันทึกข้อมูลที่สแกนล่าสุดเพื่อแสดงให้ผู้ใช้เห็น
      setLastScan(input.toString().substring(0, 30) + (input.length > 30 ? "..." : ""));
      
      // เมื่อเครื่องสแกน Zebra ส่งข้อมูลมา แสดงว่าเชื่อมต่อได้แล้ว
      if (zebraScanner) {
        scannerConnectedRef.current = true;
        consecutiveScansRef.current++;
        
        // แสดงข้อความและสั่นเมื่อได้รับข้อมูลจาก Zebra Scanner
        if (consecutiveScansRef.current === 1) {
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
      }
      
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
          inventory_item_id: null,
          isZebraScanned: zebraScanner,
          isRawInput: true
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
      
      // แสดงข้อความแบบเงียบๆ แทนการใช้ Swal ที่ต้องกดปิด
      setScanningMessage(`กำลังโหลดข้อมูล ${qrData.partNumber || 'ไม่ระบุ'} กรุณารอสักครู่...`);
      
      // ใช้ค่า partNumber หรือ inventory_item_id ที่แยกออกมาแล้ว ไม่ใช่ JSON ทั้งก้อน
      const searchParam = qrData.inventory_item_id || qrData.partNumber;
      
      // ตรวจสอบและจัดการค่า searchParam
      let encodedSearchParam = searchParam;
      // ตรวจสอบว่า searchParam เป็น JSON หรือมีภาษาไทยหรือไม่
      if (typeof searchParam === 'string') {
        if (searchParam.trim().startsWith('{') || /[\u0E00-\u0E7F]/.test(searchParam)) {
          // ถ้ามีภาษาไทยหรือเป็น JSON string ให้ส่งเฉพาะ partNumber เป็น string เท่านั้น
          encodedSearchParam = qrData.partNumber;
          console.log("Using only partNumber for search due to Thai chars:", encodedSearchParam);
        }
      }
      
      console.log(`Searching with: subinventory=${qrData.subinventory || selectedSubInv}, searchParam=${encodedSearchParam}`);
      
      // ใช้ Promise.race เพื่อป้องกันการรอนานเกินไป
      let billDetails;
      try {
        const fetchPromise = directAccessService.getBillCards(
          qrData.subinventory || selectedSubInv,
          encodedSearchParam  // ใช้ค่าที่ปรับแล้ว
        );
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("timeout")), 15000)
        );
        
        billDetails = await Promise.race([fetchPromise, timeoutPromise])
          .catch(error => {
            console.error("API Error (suppressed):", error);
            return [];
          });
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        billDetails = [];
      }

      console.log("Bill details count:", billDetails?.length || 0);

      if (billDetails && billDetails.length > 0) {
        console.log("Found bill details:", billDetails.length, "records");
        const sortedBills = [...billDetails].sort((a, b) => {
          const dateA = new Date(a.M_DATE || 0);
          const dateB = new Date(b.M_DATE || 0);
          return dateB - dateA;
        });

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
          _isOfflineData: isOfflineData,
          _zebraScanned: zebraScanner,
          _qrData: qrData
        };

        if (navigator.vibrate) navigator.vibrate(200);
        setScanningMessage("พบข้อมูล! กำลังแสดงรายละเอียด...");

        console.log('Setting selected bill:', billData);
        await new Promise(resolve => {
          setSelectedBill(billData);
          setTimeout(resolve, 300);
        });

        setShowDetailPopup(true);
        console.log("Popup visibility set to:", true);

        if (isOfflineData && !suppressErrors) {
          setTimeout(() => {
            const toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
            
            toast.fire({
              icon: 'warning',
              title: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ แสดงข้อมูลเท่าที่มี'
            });
          }, 1000);
        }
      } else {
        // กรณีไม่พบข้อมูล: สร้างข้อมูลว่างและแสดงข้อมูลโดยไม่แสดง error ปิดกั้นการทำงาน
        console.log("No bill details found, creating empty bill structure");
        
        // สร้างข้อมูล bill data แบบว่างสำหรับแสดง popup
        const emptyBillData = {
          M_PART_NUMBER: qrData.partNumber || input.toString().trim(),
          M_PART_DESCRIPTION: typeof qrData.description === 'string' ? 
            qrData.description : 
            (qrData.partNumber ? `Part ${qrData.partNumber}` : 'ไม่พบข้อมูล'),
          M_SUBINV: qrData.subinventory || selectedSubInv,
          M_DATE: new Date().toISOString(),
          M_QTY: "0",
          begin_qty: "0",
          M_ID: "-",
          TRANSACTION_TYPE_NAME: "-",
          M_USER_NAME: "-",
          inventory_item_id: qrData.inventory_item_id || "",
          relatedBills: [],
          allRelatedBills: [],
          totalQty: 0,
          billCount: 0,
          latestDate: new Date(),
          _isEmptyData: true,
          _zebraScanned: zebraScanner,
          _qrData: qrData
        };

        console.log("Created empty bill data:", emptyBillData);
        if (navigator.vibrate) navigator.vibrate([100, 100, 100]);

        await new Promise(resolve => {
          setSelectedBill(emptyBillData);
          setTimeout(resolve, 300);
        });
        
        setShowDetailPopup(true);
        console.log("Popup visibility set to true for empty data");
        
        if (!suppressErrors) {
          setTimeout(() => {
            const toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
            
            toast.fire({
              icon: 'info',
              title: `ไม่พบข้อมูลของ ${qrData.partNumber || 'ไม่ระบุ'}`
            });
          }, 500);
        }
      }
    } catch (error) {
      console.error("Scanning error:", error);
      
      if (navigator.vibrate) navigator.vibrate([400, 100, 400]);
      
      if (!suppressErrors) {
        const toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        
        toast.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
        });
      }
    } finally {
      if (!showDetailPopup && !isChangingSubInv) {
        setIsScanning(false);
        setScanningMessage(zebraScanner 
          ? "พร้อมรับข้อมูลจากเครื่องสแกน Zebra" 
          : "พร้อมสแกน QR Code");
      }
    }
  };

  // Effect for Zebra Scanner
  useEffect(() => {
    if (isOpen && zebraScanner) {
      console.log("Zebra Scanner mode activated");
      setScanningMessage("โหมดเครื่องสแกน Zebra DS22 พร้อมใช้งาน");
      scannerReadyRef.current = true;
      
      // โฟกัสที่ hidden input เพื่อรับข้อมูลจากเครื่องสแกน
      if (hiddenInputRef.current) {
        setTimeout(() => {
          hiddenInputRef.current.focus();
        }, 300);
      }
    }
    
    return () => {
      scannerReadyRef.current = false;
    };
  }, [isOpen, zebraScanner]);

  // ปรับปรุง handler สำหรับการรับข้อมูลจากเครื่องสแกน
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen || !isScanButtonActive) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);

      // รองรับการกด Enter
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        console.log("Enter key detected, processing buffer:", bufferRef.current);
        
        // ตรวจสอบว่าเป็นการพิมพ์ธรรมดาหรือไม่
        const isManualTyping = !zebraScanner && !isHighSpeedInput();
        
        if (bufferRef.current && !isManualTyping) {
          processScannedData(bufferRef.current);
          bufferRef.current = '';
          typingSpeedRef.current = [];
        } else if (isManualTyping) {
          // แจ้งเตือนถ้าเป็นการพิมพ์ธรรมดา
          setScanningMessage("โปรดใช้เครื่องสแกน QR Code เท่านั้น");
          bufferRef.current = '';
        }
        return;
      }

      // บันทึกเวลาเริ่มต้นการสแกนถ้ายังไม่มี
      if (!scanStartTimeRef.current) {
        scanStartTimeRef.current = Date.now();
        typingSpeedRef.current = [];
      }

      // บันทึกเวลาสำหรับคำนวณความเร็วการพิมพ์
      typingSpeedRef.current.push({
        char: e.key,
        time: Date.now()
      });

      // เพิ่มอักขระใหม่เข้า buffer
      bufferRef.current += e.key;
      console.log("Buffer updated:", bufferRef.current);

      // ตรวจจับรูปแบบ JSON ที่สมบูรณ์
      if (bufferRef.current.includes('{') && bufferRef.current.includes('}') && 
          bufferRef.current.indexOf('{') < bufferRef.current.lastIndexOf('}')) {
        // เมื่อพบรูปแบบ JSON ที่อาจสมบูรณ์ ตั้ง flag ว่าน่าจะได้ JSON ครบแล้ว
        jsonCompleteRef.current = true;
        
        // รอเวลาสั้นๆ ก่อนประมวลผล เผื่อยังมีข้อมูลตามมา
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (jsonCompleteRef.current && bufferRef.current) {
            // ตรวจสอบว่าเป็นการพิมพ์ธรรมดาหรือไม่
            const isManualTyping = !zebraScanner && !isHighSpeedInput();
            
            if (!isManualTyping) {
              processScannedData(bufferRef.current);
              bufferRef.current = '';
              jsonCompleteRef.current = false;
              scanStartTimeRef.current = null;
              typingSpeedRef.current = [];
            } else {
              // แจ้งเตือนถ้าเป็นการพิมพ์ธรรมดา
              setScanningMessage("โปรดใช้เครื่องสแกน QR Code เท่านั้น");
              bufferRef.current = '';
              jsonCompleteRef.current = false;
            }
          }
        }, zebraConfig.jsonDetectionDelay);
      }

      // ตรวจสอบว่าเป็นการสแกนหรือการพิมพ์ธรรมดา
      const isLikelyScanner = isHighSpeedInput() || zebraScanner;
      
      if (!jsonCompleteRef.current && isLikelyScanner) {
        // ถ้าเป็นการสแกนและมีข้อมูลมากพอ
        if (bufferRef.current.length >= zebraConfig.minLength && !isScanning) {
          // รอเวลาสั้นๆ ก่อนประมวลผล เผื่อยังมีข้อมูลตามมา
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (bufferRef.current) {
              console.log("Auto-submit from scanner detected, processing data:", bufferRef.current);
              processScannedData(bufferRef.current);
              bufferRef.current = '';
              jsonCompleteRef.current = false;
              scanStartTimeRef.current = null;
              typingSpeedRef.current = [];
            }
          }, zebraConfig.bufferTimeout);
        }
      }

      // ตั้ง timeout สำหรับการรีเซ็ตการสแกน
      const scanTimeout = zebraScanner ? zebraConfig.readTimeout : 30000;
      scanTimeoutRef.current = setTimeout(() => {
        bufferRef.current = '';
        setIsScanButtonActive(false);
        jsonCompleteRef.current = false;
        scanStartTimeRef.current = null;
        typingSpeedRef.current = [];
        setScanningMessage("กดปุ่มสแกนอีกครั้งเพื่อสแกนใหม่");
      }, scanTimeout);
    };

    // เพิ่ม handler สำหรับเหตุการณ์ Tab key ที่เครื่องสแกน Zebra อาจส่งมา
    const handleKeyDown = (e) => {
      if (!isOpen || !isScanButtonActive) return;
      
      // บางเครื่องสแกน Zebra อาจส่ง Tab แทนที่จะเป็น Enter
      if (e.key === 'Tab' && zebraScanner && zebraConfig.enableTab) {
        e.preventDefault();
        console.log("Tab key detected from Zebra scanner, processing buffer:", bufferRef.current);
        if (bufferRef.current) {
          processScannedData(bufferRef.current);
          bufferRef.current = '';
          jsonCompleteRef.current = false;
          scanStartTimeRef.current = null;
          typingSpeedRef.current = [];
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      scanStartTimeRef.current = null;
      jsonCompleteRef.current = false;
      typingSpeedRef.current = [];
    };
  }, [isOpen, isScanButtonActive, isScanning, zebraScanner, zebraConfig]);

  // Effect to handle bills update after subinventory change
  useEffect(() => {
    const handleBillsUpdate = async () => {
      if (isChangingSubInv && bills !== previousBills && latestQrData.current) {
        try {
          console.log("Attempting auto rescan with data:", latestQrData.current);
          setScanningMessage("กำลังค้นหาข้อมูลใน Subinventory ใหม่...");
          setIsScanning(true);

          // รอให้ข้อมูลอัพเดทเสร็จ
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // ใช้ค่าที่แยกออกมาแล้ว ไม่ใช่ JSON ทั้งก้อน
          const searchParam = latestQrData.current.inventory_item_id || latestQrData.current.partNumber;
          
          // ตรวจสอบและจัดการค่า searchParam
          let encodedSearchParam = searchParam;
          if (typeof searchParam === 'string') {
            if (searchParam.trim().startsWith('{') || /[\u0E00-\u0E7F]/.test(searchParam)) {
              encodedSearchParam = latestQrData.current.partNumber;
              console.log("Using only partNumber for search after subinv change:", encodedSearchParam);
            }
          }
          
          const billDetails = await directAccessService.getBillCards(selectedSubInv, encodedSearchParam);

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
              latestDate: new Date(sortedBills[0].M_DATE || new Date()),
              _zebraScanned: zebraScanner,
              _qrData: latestQrData.current
            };

            await new Promise(resolve => {
              setSelectedBill(billData);
              setTimeout(resolve, 300);
            });

            setShowDetailPopup(true);
          } else {
            throw new Error("ไม่พบข้อมูลใน Subinventory ใหม่");
          }
        } catch (error) {
          console.error("Auto rescan error:", error);
          if (navigator.vibrate) navigator.vibrate([400, 100, 400]);
          
          if (!suppressErrors) {
            await Swal.fire({
              title: "ไม่พบข้อมูล",
              html: `ไม่พบข้อมูลใน Subinventory: ${selectedSubInv}<br>สำหรับ Part Number: ${latestQrData.current.partNumber || 'ไม่ระบุ'}`,
              icon: "warning",
              confirmButtonText: "ตกลง",
              confirmButtonColor: "#3085d6",
            });
          }
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
  }, [bills, previousBills, isChangingSubInv, selectedSubInv, showDetailPopup, zebraScanner, suppressErrors]);

  // Handler เมื่อกดปุ่มสแกน
  const handleScanButtonPress = () => {
    setIsScanButtonActive(true);
    if (navigator.vibrate) navigator.vibrate(200);
    
    setScanningMessage(zebraScanner 
      ? "พร้อมรับข้อมูลจากเครื่องสแกน Zebra DS22" 
      : "พร้อมรับข้อมูลจากเครื่องสแกน QR Code");
    
    setLastScan("");
    bufferRef.current = "";
    jsonCompleteRef.current = false;
    scanStartTimeRef.current = null;
    typingSpeedRef.current = [];
    
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }

    consecutiveScansRef.current = 0;

    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = setTimeout(() => {
      if (!showDetailPopup && isScanButtonActive) {
        setIsScanButtonActive(false);
        setScanningMessage("กดปุ่มสแกนอีกครั้งเพื่อสแกนใหม่");
      }
    }, zebraScanner ? zebraConfig.readTimeout : 30000);
  };

  // Clean up เมื่อ component unmounts หรือปิด
  useEffect(() => {
    if (!isOpen) {
      setShowDetailPopup(false);
      setSelectedBill(null);
      setIsChangingSubInv(false);
      setPreviousBills(bills);
      latestQrData.current = null;
      scanStartTimeRef.current = null;
      jsonCompleteRef.current = false;
      typingSpeedRef.current = [];
    }
  }, [isOpen, bills]);

  // Handler เมื่อปิด popup
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setShowDetailPopup(false);
      setSelectedBill(null);
      setLastScan("");
      bufferRef.current = '';
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      scanStartTimeRef.current = null;
      jsonCompleteRef.current = false;
      typingSpeedRef.current = [];
    }, 300);
  };

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
            {/* Hidden input for scanner - readonly เพื่อไม่ให้สามารถพิมพ์ได้ แต่ยังรับข้อมูลจากเครื่องสแกนได้ */}
            <input
              ref={hiddenInputRef}
              type="text"
              className="opacity-0 h-0 w-0 absolute"
              autoComplete="off"
              readOnly={!zebraScanner} // แก้ไขตรงนี้: ถ้าไม่ใช่โหมด Zebra ให้เป็น readonly
              onChange={(e) => {
                // บันทึกข้อมูลใน buffer แต่ไม่อนุญาตให้แก้ไขถ้าไม่ใช่การสแกน
                if (zebraScanner) {
                  bufferRef.current = e.target.value;
                
                  // บันทึกเวลาเริ่มต้นถ้ายังไม่มี
                  if (!scanStartTimeRef.current) {
                    scanStartTimeRef.current = Date.now();
                    typingSpeedRef.current = [];
                  }
                
                  if (e.target.value) {
                    if (e.target.value.includes('{') && e.target.value.includes('}') &&
                        e.target.value.indexOf('{') < e.target.value.lastIndexOf('}')) {
                        
                      console.log("Hidden input auto-processing JSON:", e.target.value);
                      processScannedData(e.target.value);
                      e.target.value = '';
                      bufferRef.current = '';
                      scanStartTimeRef.current = null;
                      typingSpeedRef.current = [];
                      return;
                    }
                  
                    // เฉพาะข้อมูลจากเครื่องสแกนเท่านั้น
                    if (e.target.value.length >= zebraConfig.minLength && 
                        !jsonCompleteRef.current && 
                        !isScanning) {
                    
                      if (timeoutRef.current) clearTimeout(timeoutRef.current);
                      timeoutRef.current = setTimeout(() => {
                        const currentValue = e.target.value || bufferRef.current;
                        if (currentValue) {
                          console.log(`Hidden input auto-processing:`, currentValue);
                          processScannedData(currentValue);
                          e.target.value = '';
                          bufferRef.current = '';
                          scanStartTimeRef.current = null;
                          typingSpeedRef.current = [];
                        }
                      }, zebraConfig.bufferTimeout);
                    }
                  }
                } else {
                  // แจ้งเตือนถ้าผู้ใช้พยายามพิมพ์ในโหมดปกติ
                  setScanningMessage("โปรดใช้เครื่องสแกน QR Code เท่านั้น");
                  e.target.value = '';
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const scannedValue = e.target.value || bufferRef.current;
                  console.log("Hidden input value from Enter:", scannedValue);
                  
                  // ตรวจสอบว่าเป็นการพิมพ์ธรรมดาหรือไม่
                  const isManualTyping = !zebraScanner && !isHighSpeedInput();
                  
                  if (scannedValue && !isManualTyping) {
                    processScannedData(scannedValue);
                    e.target.value = '';
                    bufferRef.current = '';
                    jsonCompleteRef.current = false;
                    scanStartTimeRef.current = null;
                    typingSpeedRef.current = [];
                  } else if (isManualTyping) {
                    // แจ้งเตือนถ้าเป็นการพิมพ์ธรรมดา
                    setScanningMessage("โปรดใช้เครื่องสแกน QR Code เท่านั้น");
                    e.target.value = '';
                    bufferRef.current = '';
                  }
                }
              }}
            />

            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-2xl text-white mr-3">
                    {zebraScanner ? "barcode_scanner" : "qr_code_scanner"}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {zebraScanner ? "Zebra DS22 Scanner" : "QR Code Scanner"}
                    </h2>
                    <p className="text-xs text-blue-100 mt-0.5">
                      {zebraScanner 
                        ? "ใช้เครื่องสแกนปืนยิงในการค้นหาข้อมูล" 
                        : "ใช้เครื่องสแกน QR Code ในการค้นหาข้อมูล (ไม่สามารถพิมพ์ได้)"}
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
                    {isScanning 
                      ? "hourglass_top" 
                      : (zebraScanner ? "barcode_scanner" : "qr_code_scanner")}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isScanning ? "กำลังประมวลผล" : "พร้อมรับข้อมูล"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {scanningMessage ||
                      (zebraScanner
                        ? "กรุณากดปุ่มสแกนและใช้เครื่องสแกน Zebra DS22 ในการอ่านข้อมูล"
                        : "กรุณากดปุ่มสแกนและใช้เครื่องสแกน QR Code ในการอ่านข้อมูล (ไม่สามารถพิมพ์ได้)")}
                  </p>
                </div>

                {/* แสดงข้อมูลที่สแกนล่าสุด */}
                {lastScan && (
                  <div className="bg-gray-50 p-3 rounded-lg text-left">
                    <p className="text-xs font-medium text-gray-500 mb-1">ข้อมูลที่สแกนล่าสุด:</p>
                    <p className="text-sm text-gray-800 font-mono break-all">{lastScan}</p>
                  </div>
                )}

                {isScanning && (
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}

                {/* ตัวเลือกโหมด Zebra Scanner */}
                <div className="pt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={zebraScanner}
                      onChange={(e) => setZebraScanner(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">ใช้เครื่องสแกน Zebra DS22</span>
                  </label>
                </div>

                {/* ตัวเลือกไม่แสดง Error */}
                <div className="pt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={suppressErrors}
                      onChange={(e) => setSuppressErrors(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">ไม่แสดงข้อความแจ้งเตือน Error</span>
                  </label>
                </div>

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
                      {zebraScanner ? "barcode_scanner" : "qr_code_scanner"}
                    </span>
                    <span className="font-medium">
                      {isScanButtonActive ? 'กำลังสแกน...' : 'เริ่มสแกน'}
                    </span>
                  </button>
                </div>

                <div className="pt-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">
                        {zebraScanner 
                          ? "กดปุ่มสแกนและใช้ปืนยิง Zebra DS22" 
                          : "กดปุ่มสแกนและใช้เครื่องสแกน QR Code"}
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        ระบบนี้รองรับเฉพาะการสแกน QR Code เท่านั้น ไม่สามารถพิมพ์เพื่อค้นหาได้
                      </p>
                    </div>
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