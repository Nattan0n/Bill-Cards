import React, { useState, useEffect, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import BillDetailPopup from "../../Table/view/BillDetail/BillDetailPopup";

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
  const [lastScanTime, setLastScanTime] = useState(0);
  const [isChangingSubInv, setIsChangingSubInv] = useState(false);
  const [isScanButtonActive, setIsScanButtonActive] = useState(false);

  // Refs
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);
  const scanTimeoutRef = useRef(null);
  const hiddenInputRef = useRef(null);

  // Validate QR data with detailed logging
  const validateQrData = (data) => {
    console.log('Raw QR Data:', data);

    // Handle string input
    if (typeof data === 'string') {
      try {
        // Try parsing as JSON first
        const parsedData = JSON.parse(data);
        console.log('Successfully parsed string to JSON:', parsedData);
        return validateQrData(parsedData);
      } catch (e) {
        // If not JSON, use as direct part number
        if (/^[A-Za-z0-9\-_]+$/.test(data.trim())) {
          console.log('Direct Part Number:', data.trim());
          return {
            partNumber: data.trim(),
            subinventory: selectedSubInv
          };
        }
        throw new Error('Invalid Part Number format');
      }
    }

    // Validate JSON data structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid QR Code data');
    }

    // Check required fields
    if (!data.partNumber) {
      throw new Error('Part Number not found in QR Code');
    }

    // Validate Part Number format
    const partNumberRegex = /^[A-Za-z0-9][A-Za-z0-9\-_]*[A-Za-z0-9]$/;
    if (!partNumberRegex.test(data.partNumber.trim())) {
      throw new Error('Invalid Part Number format');
    }

    // Validate Subinventory if present
    if (data.subinventory) {
      const subinvRegex = /^[A-Z0-9\-]+$/;
      if (!subinvRegex.test(data.subinventory.trim())) {
        throw new Error('Invalid Subinventory format');
      }
    }

    return {
      partNumber: data.partNumber.trim(),
      subinventory: data.subinventory?.trim() || selectedSubInv
    };
  };

  // Find matching bill with extensive logging
  const findMatchingBill = useCallback(
    (qrData) => {
      console.log('Matching QR Data:', qrData);
      console.log('Total Bills:', bills?.length);
      console.log('Current Subinventory:', selectedSubInv);

      if (!qrData?.partNumber || !Array.isArray(bills)) {
        console.log('Invalid search input:', { qrData, billCount: bills?.length });
        return null;
      }

      // Normalize search terms
      const searchPartNumber = qrData.partNumber.trim().toUpperCase();
      const searchSubInv = (qrData.subinventory || selectedSubInv).trim().toUpperCase();

      console.log('Search Criteria:', {
        partNumber: searchPartNumber,
        subinventory: searchSubInv
      });

      // Find matching bills with detailed logging
      const matchingBills = bills.filter((bill) => {
        if (!bill?.M_PART_NUMBER || !bill?.M_SUBINV) {
          console.log('Invalid bill data:', bill);
          return false;
        }

        const billPartNumber = bill.M_PART_NUMBER.trim().toUpperCase();
        const billSubInv = bill.M_SUBINV.trim().toUpperCase();

        const isMatch = billPartNumber === searchPartNumber && 
                        billSubInv === searchSubInv;

        console.log('Comparing Bill:', {
          billPartNumber,
          billSubInv,
          match: isMatch
        });

        return isMatch;
      });

      console.log('Matching Bills:', matchingBills);

      if (matchingBills.length === 0) {
        return null;
      }

      // Sort bills by date and prepare result
      const sortedBills = matchingBills.sort((a, b) => {
        const dateA = new Date(a.M_DATE);
        const dateB = new Date(b.M_DATE);
        return dateB - dateA;
      });

      const totalQty = matchingBills.reduce(
        (sum, bill) => sum + Number(bill.M_QTY || 0),
        0
      );

      const result = {
        ...sortedBills[0],
        allRelatedBills: sortedBills,
        relatedBills: sortedBills,
        totalQty,
        billCount: matchingBills.length,
        latestDate: new Date(sortedBills[0].M_DATE)
      };

      console.log('Final Matching Result:', result);
      return result;
    },
    [bills, selectedSubInv]
  );

  // Process scanned data with comprehensive error handling
  const processScannedData = async (input) => {
    console.log('Raw Scanned Input:', input);

    // Debounce handling
    const now = Date.now();
    if (now - lastScanTime < 1000) {
      console.log('Scan debounced - too soon');
      return;
    }
    setLastScanTime(now);

    try {
      setIsScanning(true);
      setScanningMessage("Processing data...");

      // Clean and parse input
      const cleanedInput = input.replace(/[\n\r]/g, '').trim();
      console.log('Cleaned Input:', cleanedInput);

      // Validate and find bill
      const validatedData = validateQrData(cleanedInput);
      console.log('Validated QR Data:', validatedData);

      const foundBill = findMatchingBill(validatedData);
      console.log('Found Bill:', foundBill);

      if (foundBill) {
        if (navigator.vibrate) navigator.vibrate(200);
        setScanningMessage("Data found! Loading details...");
        
        setSelectedBill(foundBill);
        setShowDetailPopup(true);
      } else {
        // Detailed not found handling
        await Swal.fire({
          title: "No Data Found",
          html: `
            <div class="space-y-2">
              <p><strong>Part Number:</strong> ${validatedData.partNumber}</p>
              <p><strong>Subinventory:</strong> ${validatedData.subinventory}</p>
              <p class="text-sm text-gray-500 mt-4">Please verify the data exists in the system.</p>
            </div>
          `,
          icon: "warning",
          confirmButtonText: "OK"
        });
      }
    } catch (error) {
      console.error('Complete Scan Processing Error:', error);
      await Swal.fire({
        title: "Error",
        text: error.message || "Unable to process scanned data",
        icon: "error",
        confirmButtonText: "OK"
      });
    } finally {
      setIsScanning(false);
      setScanningMessage("Ready to scan");
      bufferRef.current = '';
    }
  };

  // Handle scanner input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen || !isScanButtonActive) return;

      console.log('Key pressed:', {
        key: e.key,
        keyCode: e.keyCode,
        currentBuffer: bufferRef.current
      });

      // Clear existing timeouts
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);

      // Handle Enter key
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        console.log('Enter key detected, processing buffer:', bufferRef.current);
        
        if (bufferRef.current) {
          processScannedData(bufferRef.current);
          bufferRef.current = '';
        }
        return;
      }

      // Add to buffer if valid character
      if (/[\w\d\-_.:{}[\]"']/.test(e.key)) {
        bufferRef.current += e.key;

        // Set timeout for processing
        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current) {
            processScannedData(bufferRef.current);
            bufferRef.current = '';
          }
        }, 100);

        // Set timeout for clearing buffer
        scanTimeoutRef.current = setTimeout(() => {
          if (bufferRef.current) {
            console.log('Scan timeout - clearing buffer:', bufferRef.current);
            bufferRef.current = '';
            setIsScanButtonActive(false);
            setScanningMessage("Press scan button again");
          }
        }, 1000);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, [isOpen, isScanButtonActive, processScannedData]);

  // Handle scan button press
  const handleScanButtonPress = () => {
    setIsScanButtonActive(true);
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }

    // Reset scan button after timeout
    setTimeout(() => {
      if (!showDetailPopup) {
        setIsScanButtonActive(false);
        setScanningMessage("Press scan button again");
      }
    }, 5000);
  };

  // Handle close
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
    setShowDetailPopup(false);
    setSelectedBill(null);
    setScannedData("");
    onClose();
  };

  if (!isOpen && !showDetailPopup) return null;

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-gray-900/45 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />

        <div className="flex items-center justify-center min-h-screen p-4">
          <div
            className={`relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate__animated animate__faster ${
              isClosing ? "animate__zoomOut" : "animate__zoomIn"
            }`}
          >
            {/* Hidden input for scanner */}
            <input
              ref={hiddenInputRef}
              type="text"
              className="opacity-0 h-0 w-0 absolute"
              autoComplete="off"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const scannedValue = e.target.value;
                  console.log('Scanned value:', scannedValue);
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
                      กดปุ่มสแกนและใช้เครื่องสแกนเพื่อเริ่มต้น ระบบจะประมวลผลข้อมูลโดยอัตโนมัติ
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
          <BillDetailPopup bill={selectedBill} onClose={handleCloseDetail} />
        </div>
      )}
    </>
  );
};

export default HandheldScanner;