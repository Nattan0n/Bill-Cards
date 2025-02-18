import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import BillDetailPopup from '../../Table/view/BillDetail/BillDetailPopup';

const HandheldScanner = ({
  isOpen,
  onClose,
  bills,
  onSelectSubInv,
  selectedSubInv,
}) => {
  const [scannedData, setScannedData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMessage, setScanningMessage] = useState('');
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Find matching bill from scanned data
  const findMatchingBill = useCallback((qrData) => {
    if (!qrData?.partNumber || !bills) return null;

    const scannedPartNumber = String(qrData.partNumber).trim().toLowerCase();
    const matchingBills = bills.filter((bill) => {
      const billPartNumber = String(bill?.M_PART_NUMBER || '').trim().toLowerCase();
      return billPartNumber === scannedPartNumber;
    });

    if (!matchingBills.length) return null;

    const sortedBills = matchingBills.sort((a, b) => {
      return new Date(b.M_DATE) - new Date(a.M_DATE);
    });

    const totalQty = matchingBills.reduce(
      (sum, bill) => sum + Number(bill.M_QTY || 0),
      0
    );

    return {
      ...sortedBills[0],
      allRelatedBills: sortedBills,
      relatedBills: sortedBills,
      totalQty,
      billCount: matchingBills.length,
      latestDate: new Date(sortedBills[0].M_DATE),
    };
  }, [bills]);

  // Handle scanner input
  const handleScannerInput = useCallback(async (input) => {
    if (!input) return;
    
    try {
      setIsScanning(true);
      setScanningMessage('กำลังประมวลผลข้อมูล...');

      let qrData;
      try {
        qrData = JSON.parse(input);
        if (!qrData.partNumber || !qrData.subinventory) {
          throw new Error('QR Code ไม่ถูกต้อง');
        }
      } catch (error) {
        // If not JSON, try to use the input directly as part number
        qrData = {
          partNumber: input.trim(),
          subinventory: selectedSubInv
        };
      }

      const scannedSubInv = qrData.subinventory;
      const scannedPartNumber = qrData.partNumber;

      // Find matching bill
      let foundBill = findMatchingBill(qrData);

      // Handle subinventory mismatch
      if (!foundBill && scannedSubInv && scannedSubInv !== selectedSubInv) {
        const willChange = await Swal.fire({
          title: 'พบข้อมูลจาก Subinventory อื่น',
          html: `Part Number นี้อยู่ใน ${scannedSubInv}<br>ต้องการเปลี่ยน Subinventory หรือไม่?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'เปลี่ยน',
          cancelButtonText: 'ยกเลิก',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
        });

        if (willChange.isConfirmed) {
          await onSelectSubInv(scannedSubInv);
          // Bill will be found after subinventory change triggers re-render
          return;
        }
      }

      if (foundBill) {
        setScanningMessage('พบข้อมูล! กำลังแสดงรายละเอียด...');
        setSelectedBill(foundBill);
        setShowDetailPopup(true);
      } else {
        await Swal.fire({
          title: 'ไม่พบข้อมูล',
          html: `ไม่พบข้อมูล Bill ที่ตรงกับรหัสที่สแกน<br><br>
                 <strong>ข้อมูลที่สแกนได้:</strong><br>
                 Part Number: ${scannedPartNumber || 'ไม่พบข้อมูล'}<br>
                 Subinventory: ${scannedSubInv || selectedSubInv || 'ไม่พบข้อมูล'}`,
          icon: 'warning',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#3085d6',
        });
      }
    } catch (error) {
      console.error('Scanning error:', error);
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setIsScanning(false);
      setScannedData('');
      if (!showDetailPopup) {
        setScanningMessage('พร้อมรับข้อมูลจากเครื่องสแกน');
      }
    }
  }, [selectedSubInv, onSelectSubInv, findMatchingBill]);

  // Listen for scanner input
  useEffect(() => {
    let buffer = '';
    let timeout;

    const handleKeyPress = (e) => {
      // Ignore if popup is not open
      if (!isOpen) return;
      
      // Reset timeout
      clearTimeout(timeout);
      
      // Add character to buffer
      buffer += e.key;
      
      // Process buffer after delay (assuming scanner sends data quickly)
      timeout = setTimeout(() => {
        if (buffer.length > 0) {
          handleScannerInput(buffer);
          buffer = '';
        }
      }, 50);
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      clearTimeout(timeout);
    };
  }, [isOpen, handleScannerInput]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setShowDetailPopup(false);
      setSelectedBill(null);
      setScannedData('');
    }, 300);
  };

  const handleCloseDetail = () => {
    setShowDetailPopup(false);
    setSelectedBill(null);
    setScannedData('');
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
                <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-blue-600">
                    {isScanning ? 'hourglass_top' : 'qr_code_scanner'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isScanning ? 'กำลังประมวลผล' : 'พร้อมรับข้อมูล'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {scanningMessage || 'กรุณาใช้เครื่องสแกนเพื่อสแกน QR Code หรือ Barcode'}
                  </p>
                </div>

                {isScanning && (
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}

                <div className="pt-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-700">
                      เชื่อมต่อเครื่องสแกนของคุณและเริ่มสแกนได้ทันที
                      ระบบจะประมวลผลข้อมูลโดยอัตโนมัติ
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