import React, { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import BillDetailPopup from "../../Table/view/BillDetail/BillDetailPopup";

const HandheldScanner = ({
  isOpen,
  onClose,
  onSelectSubInv,
  selectedSubInv,
  bills,
}) => {
  // States
  const [isScanning, setIsScanning] = useState(false);
  const [scanningMessage, setScanningMessage] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isChangingSubInv, setIsChangingSubInv] = useState(false);
  const [previousBills, setPreviousBills] = useState(bills);

  // Refs
  const latestQrData = useRef(null);
  const inputRef = useRef(null);

  // Effect to handle bills update after subinventory change
  useEffect(() => {
    const handleBillsUpdate = async () => {
      if (isChangingSubInv && bills !== previousBills && latestQrData.current) {
        try {
          setScanningMessage("กำลังค้นหาข้อมูลใน Subinventory ใหม่...");
          setIsScanning(true);

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const foundBill = findMatchingBill(latestQrData.current);
          if (foundBill) {
            if (navigator.vibrate) navigator.vibrate(200);
            setScanningMessage("พบข้อมูล! กำลังแสดงรายละเอียด...");

            setSelectedBill(foundBill);
            setShowDetailPopup(true);
          } else {
            await Swal.fire({
              title: "ไม่พบข้อมูล",
              html: `ไม่พบข้อมูล Bill ที่ตรงกับ QR Code ใน Subinventory ใหม่<br><br>
                     <strong>ข้อมูลที่สแกนได้:</strong><br>
                     Part Number: ${
                       latestQrData.current.partNumber || "ไม่พบข้อมูล"
                     }<br>
                     Subinventory ใหม่: ${selectedSubInv || "ไม่พบข้อมูล"}`,
              icon: "warning",
            });
          }
        } catch (error) {
          console.error("Auto rescan error:", error);
          await Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: `ไม่สามารถค้นหาข้อมูลได้: ${error.message}`,
            icon: "error",
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

  // QR Code processing function
  const processQRCode = async (scannedData) => {
    try {
      setIsScanning(true);
      setScanningMessage("กำลังประมวลผลข้อมูลที่สแกน...");

      const qrData = JSON.parse(scannedData);

      if (!qrData.partNumber || !qrData.subinventory) {
        throw new Error("รูปแบบ QR Code ไม่ถูกต้อง");
      }

      latestQrData.current = qrData;

      const scannedSubInv = qrData.subinventory;
      const scannedPartNumber = qrData.partNumber;

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
        });

        if (willChange.isConfirmed) {
          setIsChangingSubInv(true);
          setPreviousBills(bills);
          setScanningMessage(
            `กำลังเปลี่ยน Subinventory เป็น ${scannedSubInv}...`
          );

          try {
            await onSelectSubInv(scannedSubInv);
          } catch (error) {
            throw new Error("ไม่สามารถเปลี่ยน Subinventory ได้");
          }
        }
      } else if (foundBill) {
        if (navigator.vibrate) navigator.vibrate(200);
        setScanningMessage("พบข้อมูล! กำลังแสดงรายละเอียด...");

        setSelectedBill(foundBill);
        setShowDetailPopup(true);
      } else {
        await Swal.fire({
          title: "ไม่พบข้อมูล",
          html: `ไม่พบข้อมูล Bill ที่ตรงกับ QR Code<br><br>
                 <strong>ข้อมูลที่สแกนได้:</strong><br>
                 Part Number: ${scannedPartNumber || "ไม่พบข้อมูล"}<br>
                 Subinventory จาก QR: ${scannedSubInv || "ไม่พบข้อมูล"}`,
          icon: "warning",
        });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการสแกน:", error);
      setScanningMessage(`ข้อผิดพลาด: ${error.message}`);
      await Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        icon: "error",
      });
    } finally {
      if (!showDetailPopup && !isChangingSubInv) {
        setIsScanning(false);
        setScanningMessage("พร้อมสแกน QR Code");
      }
    }
  };

  // จัดการ keyboard input จากเครื่องสแกน
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = async (event) => {
      if (event.key === "Enter" && event.target.value) {
        await processQRCode(event.target.value);
        event.target.value = "";
      }
    };

    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "absolute";
    input.style.opacity = "0";
    input.style.pointerEvents = "none";
    document.body.appendChild(input);
    input.focus();
    input.addEventListener("keypress", handleKeyPress);

    return () => {
      input.removeEventListener("keypress", handleKeyPress);
      document.body.removeChild(input);
    };
  }, [isOpen, onSelectSubInv, selectedSubInv, bills, showDetailPopup]);

  // ฟังก์ชันค้นหา bill ที่ตรงกับ QR code (เหมือนเดิม)
  const findMatchingBill = (qrData) => {
    if (!qrData?.partNumber || !bills) return null;

    const qrPartNumber = String(qrData.partNumber).trim().toLowerCase();

    const matchingBills = bills.filter((bill) => {
      const billPartNumber = String(bill?.M_PART_NUMBER || "")
        .trim()
        .toLowerCase();
      return billPartNumber === qrPartNumber;
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
  };

  // จัดการการปิด
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (!showDetailPopup) {
        onClose(false); // ส่งค่า false เพื่อไม่ปิด Navigation
      }
      setIsClosing(false);
    }, 300);
  };
  
  const handleCloseDetail = () => {
    setShowDetailPopup(false);
    setSelectedBill(null);
    onClose(true); // ส่งค่า true เมื่อปิด Detail Popup
  };

  // Reset state khen component unmount
  useEffect(() => {
    if (!isOpen) {
      setShowDetailPopup(false);
      setSelectedBill(null);
      setIsChangingSubInv(false);
      setPreviousBills(bills);
      latestQrData.current = null;
    }
  }, [isOpen, bills]);

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
            className={`relative w-full max-w-[800px] h-[calc(100vh-2rem)] md:h-auto bg-white/85 rounded-3xl shadow-2xl overflow-hidden animate__animated animate__faster ${
              isClosing ? "animate__zoomOut" : "animate__zoomIn"
            }`}
          >
            {/* ส่วนหัว */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 px-4 py-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-2xl text-white mr-3">
                    qr_code_scanner
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      สแกน QR Code
                    </h2>
                    <p className="text-xs text-blue-100 mt-0.5">
                      ใช้เครื่องสแกนมือถือเพื่อสแกน QR Code
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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

            {/* เนื้อหา */}
            <div className="p-6">
              <div className="text-center">
                {isScanning ? (
                  <div className="space-y-3">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
                    <p className="text-gray-600">{scanningMessage}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-gray-400">
                        qr_code_scanner
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        พร้อมสแกน
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        ใช้เครื่องสแกนของคุณเพื่อสแกน QR Code
                      </p>
                    </div>
                  </div>
                )}
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