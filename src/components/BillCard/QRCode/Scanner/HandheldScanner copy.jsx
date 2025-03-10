import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import BillDetailPopup from "../../Table/view/BillDetail/BillDetailPopup";
import { directAccessService } from "../../../../services/directAccessService";
import { inventoryService } from "../../../../services/inventoryService";

const HandheldScanner = ({
  isOpen,
  onClose,
  bills,
  onSelectSubInv,
  selectedSubInv,
  isLoading: parentLoading,
  error: parentError,
}) => {
  // States
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMessage, setScanningMessage] = useState("");
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isChangingSubInv, setIsChangingSubInv] = useState(false);
  const [isScanButtonActive, setIsScanButtonActive] = useState(false);
  const [previousSubInv, setPreviousSubInv] = useState(selectedSubInv); // เก็บค่า subinv เดิมไว้
  const [lastScan, setLastScan] = useState("");
  const [inputValue, setInputValue] = useState(""); // ใช้ controlled input

  // Zebra scanner config
  const zebraConfig = {
    minLength: 3, // ข้อมูลขั้นต่ำที่จะประมวลผล
    readTimeout: 300000, // 5 นาที
    autoProcessDelay: 300, // เวลารอประมวลผลอัตโนมัติ (ms)
    jsonDetectionDelay: 50, // เวลารอเมื่อตรวจพบ JSON
  };

  // Refs
  const inputRef = useRef(null);
  const autoProcessTimeoutRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const latestQrDataRef = useRef(null);
  const isProcessingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastInputTimeRef = useRef(0);
  const inputStableTimeoutRef = useRef(null);
  const pendingSubInvChangeRef = useRef(null); // เก็บข้อมูลระหว่างการเปลี่ยน subinv

  // เพิ่ม cleanup เมื่อ component unmount
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      if (autoProcessTimeoutRef.current) {
        clearTimeout(autoProcessTimeoutRef.current);
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      if (inputStableTimeoutRef.current) {
        clearTimeout(inputStableTimeoutRef.current);
      }
    };
  }, []);

  // ตรวจจับการเปลี่ยนแปลงของ subinventory
  useEffect(() => {
    // ถ้ามีการเปลี่ยน subinventory และกำลังรอ
    if (selectedSubInv !== previousSubInv && isChangingSubInv) {
      console.log(`Subinventory changed from ${previousSubInv} to ${selectedSubInv}`);
      
      // ถ้ามีข้อมูลที่รออยู่ (จาก QR ที่สแกนล่าสุด)
      if (latestQrDataRef.current) {
        console.log("Setting up re-scan with latest data after subinv change");
        
        // ตั้งค่าข้อมูลที่รออยู่
        pendingSubInvChangeRef.current = {
          data: latestQrDataRef.current,
          newSubInv: selectedSubInv
        };
        
        // ทำ rescan หลังจาก render รอบใหม่
        setTimeout(() => {
          if (mountedRef.current && pendingSubInvChangeRef.current) {
            console.log("Auto re-scanning after subinventory change");
            processScannedData(pendingSubInvChangeRef.current.data.rawData);
            pendingSubInvChangeRef.current = null;
          }
        }, 500);
      }
    }
    
    // อัพเดต previousSubInv
    setPreviousSubInv(selectedSubInv);
  }, [selectedSubInv]);

  // Validate และแปลง QR data
  const validateQrData = (data) => {
    try {
      if (!data) {
        throw new Error("ไม่พบข้อมูล");
      }
      
      console.log("Raw data from scanner:", data);
      const trimmedData = data.toString().trim();
      
      let partNumber = null;
      let subinventory = selectedSubInv || null;
      let inventory_item_id = null;
      let jsonData = null;
      
      // ลองแปลง JSON
      if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
        try {
          jsonData = JSON.parse(trimmedData);
          console.log("Successfully parsed JSON data:", jsonData);
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError);
          
          // ถ้าแปลง JSON ไม่ได้ ลองใช้ regex
          try {
            const partNumberMatch = trimmedData.match(/"partNumber"\s*:\s*"([^"]+)"/);
            const subinventoryMatch = trimmedData.match(/"subinventory"\s*:\s*"([^"]+)"/);
            const inventoryItemIdMatch = trimmedData.match(/"inventory_item_id"\s*:\s*"([^"]+)"/);
            
            if (partNumberMatch) partNumber = partNumberMatch[1];
            if (subinventoryMatch) subinventory = subinventoryMatch[1];
            if (inventoryItemIdMatch) inventory_item_id = inventoryItemIdMatch[1];
            
            console.log("Manually extracted with regex:", { partNumber, subinventory, inventory_item_id });
          } catch (regexError) {
            console.error("Regex extraction failed:", regexError);
          }
        }
      }
      
      // ถ้ามี JSON data ที่แปลงได้
      if (jsonData) {
        partNumber = jsonData.partNumber || jsonData.PartNumber || jsonData.PARTNUMBER;
        subinventory = jsonData.subinventory || jsonData.Subinventory || jsonData.SUBINVENTORY || selectedSubInv;
        inventory_item_id = jsonData.inventory_item_id || jsonData.Inventory_item_id || jsonData.INVENTORY_ITEM_ID;
        
        // ถ้า subinventory เป็น Base64
        if (jsonData.subinventory_encoded) {
          try {
            subinventory = decodeURIComponent(atob(jsonData.subinventory_encoded));
          } catch (error) {
            console.error("Base64 decode error:", error);
          }
        }
      } else {
        // ถ้าไม่ใช่ JSON ใช้ข้อมูลเป็น part number โดยตรง
        // ตรวจสอบว่ามีรูปแบบของ part number ที่มีการเว้นวรรค
        partNumber = trimmedData;
        
        // ตรวจสอบรูปแบบพิเศษ เช่น "xxxxx-xxxx xX" หรือ part number ที่มีเว้นวรรค
        const partNumberRegex = /^(\d+-\d+\s\w\w|\d+\s\d+|\w+-\w+\s\w+)$/;
        if (partNumberRegex.test(trimmedData)) {
          console.log("Special part number format detected with spaces:", trimmedData);
          // รักษารูปแบบดั้งเดิมไว้
          partNumber = trimmedData;
        }
      }
      
      // ถ้าไม่มีข้อมูลที่จำเป็น
      if (!partNumber && !inventory_item_id) {
        throw new Error("ไม่สามารถระบุ Part Number ได้");
      }
      
      console.log("Validated data:", { partNumber, subinventory, inventory_item_id });
      return {
        partNumber,
        subinventory,
        inventory_item_id,
        rawData: data
      };
    } catch (error) {
      console.error("QR data validation error:", error);
      throw error;
    }
  };

  // ฟังก์ชันประมวลผลข้อมูลที่สแกนได้
  const processScannedData = async (input) => {
    if (!input || isProcessingRef.current) return;
    
    try {
      isProcessingRef.current = true;
      setIsScanning(true);
      setScanningMessage("กำลังประมวลผลข้อมูล...");
      console.log("Processing scanner input:", input);
      
      // เคลียร์ input field
      setInputValue("");
      
      // บันทึกข้อมูลที่สแกนล่าสุด (แสดงแค่บางส่วน)
      if (typeof input === 'string') {
        setLastScan(input.substring(0, 30) + (input.length > 30 ? "..." : ""));
      } else {
        setLastScan(JSON.stringify(input).substring(0, 30) + "...");
      }
      
      // สั่นเพื่อแจ้งเตือนผู้ใช้
      if (navigator.vibrate) navigator.vibrate(100);
      
      // แปลงและตรวจสอบข้อมูลที่สแกนได้
      let qrData;
      try {
        qrData = validateQrData(input);
        latestQrDataRef.current = qrData;
      } catch (error) {
        console.error("Validation error:", error);
        setScanningMessage("ข้อมูลไม่ถูกต้อง กรุณาลองใหม่");
        setTimeout(() => {
          if (mountedRef.current) {
            setScanningMessage("พร้อมรับข้อมูล");
          }
        }, 2000);
        isProcessingRef.current = false;
        return;
      }
      
      // ตรวจสอบว่า subinventory ตรงกับที่เลือกไว้หรือไม่
      if (qrData.subinventory && qrData.subinventory !== selectedSubInv) {
        console.log("Different subinventory detected:", qrData.subinventory);
        setScanningMessage(`พบข้อมูลจาก ${qrData.subinventory}`);
        
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
          setScanningMessage(`กำลังเปลี่ยน Subinventory เป็น ${qrData.subinventory}...`);
          
          try {
            // เรียกฟังก์ชันเปลี่ยน subinventory
            await onSelectSubInv(qrData.subinventory);
            
            // จะมีการประมวลผลใหม่ในรอบถัดไปจาก useEffect
            // จบฟังก์ชัน และออกจากลูปการประมวลผล
            isProcessingRef.current = false;
            return;
          } catch (error) {
            console.error("Error changing subinventory:", error);
            await Swal.fire({
              title: "เกิดข้อผิดพลาด",
              text: `ไม่สามารถเปลี่ยน Subinventory ได้: ${error.message}`,
              icon: "error",
              confirmButtonText: "ตกลง"
            });
            
            // รีเซ็ตสถานะการเปลี่ยน subinventory
            setIsChangingSubInv(false);
            isProcessingRef.current = false;
            return;
          }
        }
      }
      
      setScanningMessage(`กำลังค้นหาข้อมูล ${qrData.partNumber || 'ไม่ระบุ'}...`);
      
      // เตรียมพารามิเตอร์สำหรับการค้นหา
      const searchParam = qrData.inventory_item_id || qrData.partNumber;
      let encodedSearchParam = searchParam;
      
      // ถ้ามีช่องว่างหรือภาษาไทย ต้องใช้ encodeURIComponent
      if (typeof searchParam === 'string') {
        if (searchParam.includes(' ') || /[\u0E00-\u0E7F]/.test(searchParam)) {
          console.log(`Special characters or spaces found in part number: "${searchParam}", encoding...`);
          encodedSearchParam = encodeURIComponent(searchParam);
        }
      }
      
      console.log(`Searching with: subinventory=${qrData.subinventory || selectedSubInv}, searchParam=${encodedSearchParam}`);
      
      // ค้นหาข้อมูล bill cards ด้วย directAccessService
      let billDetails = [];
      try {
        setScanningMessage(`กำลังค้นหาข้อมูล...`);
        
        // สร้าง options สำหรับ retry logic
        const options = {
          retries: 2,
          retryDelay: 1000
        };
        
        billDetails = await directAccessService.fetchWithRetry(
          () => directAccessService.getBillCards(
            qrData.subinventory || selectedSubInv,
            searchParam // ส่ง searchParam ที่ยังไม่ได้ encode ไป ให้ service จัดการเอง
          ),
          options.retries,
          options.retryDelay
        );
        
        console.log("API response:", billDetails?.length || 0, "records");
      } catch (error) {
        console.error("API error:", error);
        billDetails = [];
      }
      
      // ดึงข้อมูล inventory เพิ่มเติม
      let inventoryItems = [];
      try {
        setScanningMessage(`กำลังดึงข้อมูลสต็อค...`);
        
        const inventories = await inventoryService.fetchInventories();
        const currentInventory = inventories.find(inv => 
          inv.secondary_inventory === (qrData.subinventory || selectedSubInv)
        );
        
        if (currentInventory?.inventory_items) {
          inventoryItems = currentInventory.inventory_items;
          console.log(`Found ${inventoryItems.length} inventory items`);
        }
      } catch (error) {
        console.error("Inventory fetch error:", error);
      }

      // ประมวลผลและแสดงข้อมูล
      if (billDetails && billDetails.length > 0) {
        console.log("Found bill details:", billDetails.length, "records");
        const sortedBills = [...billDetails].sort((a, b) => {
          const dateA = new Date(a.M_DATE || 0);
          const dateB = new Date(b.M_DATE || 0);
          return dateB - dateA;
        });

        // ค้นหาข้อมูล stock จาก inventoryItems
        const matchingInventoryItem = inventoryItems.find(item => 
          item.part_number === sortedBills[0].M_PART_NUMBER || 
          item.inventory_item_id === sortedBills[0].inventory_item_id
        );
        
        // อัพเดทค่า stk_qty ถ้าจำเป็น
        if (matchingInventoryItem && 
            (sortedBills[0].stk_qty === "0" || 
             !sortedBills[0].stk_qty || 
             parseFloat(sortedBills[0].stk_qty) === 0)) {
          console.log("Updating stk_qty from inventory:", matchingInventoryItem.stk_qty);
          
          sortedBills.forEach(bill => {
            bill.stk_qty = matchingInventoryItem.stk_qty || bill.stk_qty || "0";
          });
        }

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
          _qrData: qrData,
          _inventoryData: matchingInventoryItem || null
        };

        // สั่นให้รู้ว่าพบข้อมูล
        if (navigator.vibrate) navigator.vibrate(200);
        setScanningMessage("พบข้อมูล!");

        // แสดงข้อมูล
        console.log('Setting selected bill:', billData);
        setSelectedBill(billData);
        setShowDetailPopup(true);
      } else {
        // กรณีไม่พบข้อมูล แต่ยังมี inventory data
        console.log("No bill details found, checking inventory data");
        
        const matchingInventoryItem = inventoryItems.find(item => 
          item.part_number === qrData.partNumber || 
          item.inventory_item_id === qrData.inventory_item_id
        );
        
        let stockQty = "0";
        if (matchingInventoryItem) {
          console.log("Found matching inventory item:", matchingInventoryItem);
          stockQty = matchingInventoryItem.stk_qty || "0";
        }
        
        // สร้างข้อมูลเปล่าเพื่อแสดง
        const emptyBillData = {
          M_PART_NUMBER: qrData.partNumber || input.toString().trim(),
          M_PART_DESCRIPTION: matchingInventoryItem?.part_description || 
            `Part ${qrData.partNumber}`,
          M_SUBINV: qrData.subinventory || selectedSubInv,
          M_DATE: new Date().toISOString(),
          M_QTY: "0",
          begin_qty: "0",
          stk_qty: stockQty,
          M_ID: "-",
          TRANSACTION_TYPE_NAME: "-",
          M_USER_NAME: "-",
          inventory_item_id: qrData.inventory_item_id || (matchingInventoryItem?.inventory_item_id || ""),
          relatedBills: [],
          allRelatedBills: [],
          totalQty: 0,
          billCount: 0,
          latestDate: new Date(),
          _isEmptyData: true,
          _qrData: qrData,
          _inventoryData: matchingInventoryItem || null
        };

        console.log("Created empty bill data with stk_qty:", emptyBillData.stk_qty);
        
        // สั่นแจ้งเตือนแบบอื่น (สั้นๆ 3 ครั้ง)
        if (navigator.vibrate) navigator.vibrate([100, 100, 100]);

        // แสดงข้อมูลว่าง
        setScanningMessage("ไม่พบข้อมูลการเคลื่อนไหว");
        setSelectedBill(emptyBillData);
        setShowDetailPopup(true);
      }
    } catch (error) {
      console.error("Processing error:", error);
      
      // สั่นแจ้งว่ามีข้อผิดพลาด
      if (navigator.vibrate) navigator.vibrate([400, 100, 400]);
      
      setScanningMessage(`เกิดข้อผิดพลาด: ${error.message}`);
      setTimeout(() => {
        if (mountedRef.current) {
          setScanningMessage("พร้อมรับข้อมูล");
          setIsScanButtonActive(true);
        }
      }, 3000);
    } finally {
      // รีเซ็ตสถานะการประมวลผล
      isProcessingRef.current = false;
      
      if (!showDetailPopup && !isChangingSubInv && mountedRef.current) {
        setIsScanning(false);
        setScanningMessage("พร้อมรับข้อมูล");
        
        // โฟกัสที่ input อีกครั้ง
        if (inputRef.current) {
          setTimeout(() => {
            try {
              inputRef.current.focus();
              inputRef.current.select();
            } catch (e) {
              console.log("Focus error:", e);
            }
          }, 300);
        }
      }
    }
  };

  // ตรวจสอบการหยุดพิมพ์และประมวลผลอัตโนมัติ
  const checkInputStable = (value) => {
    if (!value || value.length < zebraConfig.minLength) return;
    
    // เคลียร์ timeout เก่า
    if (inputStableTimeoutRef.current) {
      clearTimeout(inputStableTimeoutRef.current);
    }
    
    // ตั้ง timeout ใหม่
    inputStableTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && value) {
        console.log("Auto processing after stable input:", value);
        processScannedData(value);
      }
    }, zebraConfig.autoProcessDelay);
  };

  // Effect สำหรับการตั้งค่า input focus เมื่อเปิด
  useEffect(() => {
    if (isOpen) {
      console.log("Scanner opened, activating focus");
      setScanningMessage("พร้อมรับข้อมูลจากเครื่องสแกน");
      
      // โฟกัสที่ input
      setTimeout(() => {
        if (inputRef.current && mountedRef.current) {
          try {
            inputRef.current.focus();
            inputRef.current.select();
            setIsScanButtonActive(true);
          } catch (e) {
            console.error("Focus error:", e);
          }
        }
      }, 300);
    }
    
    return () => {
      // ล้างค่าเมื่อปิด component
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      if (autoProcessTimeoutRef.current) {
        clearTimeout(autoProcessTimeoutRef.current);
      }
      if (inputStableTimeoutRef.current) {
        clearTimeout(inputStableTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // กดปุ่มสแกน
  const handleScanButtonPress = () => {
    setIsScanButtonActive(true);
    if (navigator.vibrate) navigator.vibrate(50);
    
    setScanningMessage("พร้อมรับข้อมูลจากเครื่องสแกน");
    setLastScan("");
    setInputValue("");
    
    // โฟกัสที่ input
    if (inputRef.current) {
      try {
        inputRef.current.focus();
        inputRef.current.select();
      } catch (e) {
        console.error("Focus error:", e);
      }
    }
    
    // ตั้งเวลาหมดอายุการสแกน
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    
    scanTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && !showDetailPopup && isScanButtonActive) {
        setIsScanButtonActive(false);
        setScanningMessage("กดปุ่มสแกนเพื่อเริ่มใหม่");
      }
    }, zebraConfig.readTimeout);
  };

  // ปิด popup
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setShowDetailPopup(false);
      setSelectedBill(null);
      setLastScan("");
      setInputValue("");
      if (autoProcessTimeoutRef.current) clearTimeout(autoProcessTimeoutRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (inputStableTimeoutRef.current) clearTimeout(inputStableTimeoutRef.current);
    }, 300);
  };

  // ปิด popup รายละเอียด
  const handleCloseDetail = () => {
    setShowDetailPopup(false);
    setSelectedBill(null);
    onClose();
  };

  // ไม่แสดงถ้าไม่ได้เปิดหรือไม่มี detail popup
  if (!isOpen && !showDetailPopup) return null;

  // แสดงข้อความ error จาก parent
  if (parentError) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-gray-900/45 transition-opacity" onClick={handleClose} />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center text-red-500 mb-4">
              <span className="material-symbols-outlined mr-2">error</span>
              <h2 className="text-xl font-bold">เกิดข้อผิดพลาด</h2>
            </div>
            <p className="mb-4 text-gray-700">{parentError}</p>
            <button
              onClick={handleClose}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ตกลง
            </button>
          </div>
        </div>
      </div>
    );
  }

  // แสดง loading จาก parent
  if (parentLoading) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-gray-900/45 transition-opacity" />
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium text-gray-800">กำลังโหลดข้อมูล...</p>
            <p className="text-sm text-gray-600 mt-2">กรุณารอสักครู่</p>
          </div>
        </div>
      </div>
    );
  }

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
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-2xl text-white mr-3">
                    barcode_scanner
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Zebra DS22 Scanner
                    </h2>
                    <p className="text-xs text-blue-100 mt-0.5">
                      ใช้เครื่องสแกนปืนยิงในการค้นหาข้อมูล
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
              {/* กล่องรับข้อมูล - มองเห็นได้แต่ไม่เน้นให้เห็นชัด */}
              <input
                ref={inputRef}
                type="text" 
                className="w-full px-4 py-3 border border-blue-200 rounded-xl text-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="คลิกที่นี่เพื่อใช้งานเครื่องสแกน"
                value={inputValue}
                onFocus={() => setIsScanButtonActive(true)}
                onChange={(e) => {
                  // อัพเดทค่าใน state
                  const newValue = e.target.value;
                  setInputValue(newValue);
                  
                  // อัพเดท UI เพื่อให้คนเห็นว่ามีการเปลี่ยนแปลง
                  setLastScan(newValue);
                  
                  // บันทึกเวลาล่าสุดที่ได้รับข้อมูล
                  lastInputTimeRef.current = Date.now();
                  
                  // ตรวจสอบเพื่อประมวลผลอัตโนมัติเมื่อข้อมูลหยุดการเปลี่ยนแปลง
                  checkInputStable(newValue);
                }}
                onKeyDown={(e) => {
                  // เมื่อกด Enter
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    
                    if (inputValue) {
                      console.log("Processing on Enter:", inputValue);
                      processScannedData(inputValue);
                    }
                  }
                  
                  // เมื่อกด Tab (บางเครื่อง Zebra ส่ง Tab)
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    
                    if (inputValue) {
                      console.log("Processing on Tab:", inputValue);
                      processScannedData(inputValue);
                    }
                  }
                }}
              />

              <div className="text-center space-y-4">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center
                  ${isScanning ? 'bg-blue-100 animate-pulse' : 'bg-blue-50'}`}>
                  <span className={`material-symbols-outlined text-3xl text-blue-600
                    ${isScanning ? 'animate-spin' : ''}`}>
                    {isScanning ? "hourglass_top" : "barcode_scanner"}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isScanning ? "กำลังประมวลผล" : "พร้อมรับข้อมูล"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {scanningMessage || "กดปุ่มสแกนและใช้ปืนยิง Zebra DS22 ในการอ่านข้อมูล"}
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
                      barcode_scanner
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
                        ใช้ปืนยิง Zebra DS22 สแกน QR Code หรือ Barcode
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        คลิกที่กล่องข้อความด้านบนก่อนสแกนเพื่อโฟกัส
                      </p>
                      <p className="text-xs text-blue-600 mt-2 text-center italic">
                        ข้อมูลจะถูกส่งอัตโนมัติหลังสแกน
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