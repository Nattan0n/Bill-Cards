import React, { useState, useEffect, useMemo } from "react";
import { billCardService } from "../../../../../services/billCardService";
import Swal from "sweetalert2";
import { parseDate, getLatestMonthAndYear } from "../../../../../utils/dateUtils";

import { Header } from "./Header";
import { PartCard } from "./PartCard";
import { PartInfo } from "./PartInfo";
import { DateFilter } from "./DateFilter";
import { InventoryTable } from "./InventoryTable";
import { exportToExcel } from "./utils/exportToExcel";
import { MobileView } from "./MobileView/MobileView";

const BillDetailPopup = ({ bill, onClose }) => {
  const [billDetails, setBillDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [isClosing, setIsClosing] = useState(false);
  const [sortDirection, setSortDirection] = useState('desc');
  const [totalRecordCount, setTotalRecordCount] = useState(0);
  const [isFiltered, setIsFiltered] = useState(false);

  // Fetch Bill Card Details
  useEffect(() => {
    const fetchBillDetails = async () => {
      try {
        const details = await billCardService.getBillCards(
          bill.M_SUBINV,
          bill.inventory_item_id || bill.M_PART_NUMBER
        );

        console.log("Fetched Bill Details:", details);
        setBillDetails(details);
        setTotalRecordCount(details.length);

        // แก้ไขการตั้งค่าตัวกรองวันที่เริ่มต้น
        if (details.length > 0) {
          // ใช้ฟังก์ชัน getLatestMonthAndYear เพื่อหาเดือนล่าสุดที่มีข้อมูล
          const latestMonth = getLatestMonthAndYear(details);
          
          if (latestMonth) {
            // ตั้งค่าตัวกรองวันที่ให้แสดงเฉพาะเดือนล่าสุด
            setDateFilter({
              startDate: latestMonth.startDate.toISOString().split("T")[0],
              endDate: latestMonth.endDate.toISOString().split("T")[0],
            });
          } else {
            // ถ้าไม่สามารถหาเดือนล่าสุดได้ ใช้วิธีเดิม
            const sortedDates = details
              .map((item) => parseDate(item.M_DATE))
              .filter(Boolean)
              .sort((a, b) => a - b);
            
            if (sortedDates.length > 0) {
              const oldestDate = sortedDates[0];
              const startDate = new Date(
                oldestDate.getFullYear(),
                oldestDate.getMonth(),
                1
              );
              
              const latestDate = sortedDates[sortedDates.length - 1];
              // วิธีที่ถูกต้องในการหาวันสุดท้ายของเดือน
              const endDate = new Date(
                latestDate.getFullYear(),
                latestDate.getMonth() + 1,
                0
              );
              endDate.setHours(23, 59, 59, 999);
              
              setDateFilter({
                startDate: startDate.toISOString().split("T")[0],
                endDate: endDate.toISOString().split("T")[0],
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching bill details:", error);
        
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: `ไม่สามารถโหลดข้อมูล Bill Card: ${error.message}`,
          footer: `<a href="#">ติดต่อผู้ดูแลระบบ</a>`
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillDetails();
  }, [bill]);

  // Process and sort inventory data
  const inventoryData = useMemo(() => {
    if (!billDetails.length) return [];

    return billDetails
      .map((item) => {
        const parsedDate = parseDate(item.M_DATE);
        if (!parsedDate) return null;

        return {
          id: item.M_ID,
          numericId: Number(item.M_ID),
          date_time: item.M_DATE,
          quantity_sold: Number(item.M_QTY || 0),
          transaction_type: item.TRANSACTION_TYPE_NAME,
          username: item.M_USER_NAME,
          source_name: item.M_SOURCE_NAME || "-",
          begin_qty: Number(item.begin_qty || 0),
          m_date_begin: item.m_date_begin,
          eDocumentNo: item.M_SOURCE_REFERENCE || "-",
          stk_qty: item.stk_qty,
          parsedDate,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.parsedDate.getTime() === b.parsedDate.getTime()) {
          return a.numericId - b.numericId;
        }
        return a.parsedDate.getTime() - b.parsedDate.getTime();
      });
  }, [billDetails]);

  // Filter inventory based on date range
  const filteredInventoryData = useMemo(() => {
    if (!inventoryData.length || !dateFilter.startDate || !dateFilter.endDate) {
      setIsFiltered(false);
      return inventoryData;
    }

    const startDate = new Date(dateFilter.startDate);
    const endDate = new Date(dateFilter.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const filtered = inventoryData.filter((item) => {
      const itemDate = item.parsedDate;
      return itemDate >= startDate && itemDate <= endDate;
    });
    
    // ตรวจสอบว่ามีการกรองหรือไม่ โดยดูว่าจำนวนข้อมูลที่กรองได้น้อยกว่าข้อมูลทั้งหมดหรือไม่
    setIsFiltered(filtered.length < inventoryData.length);
    
    return filtered;
  }, [inventoryData, dateFilter]);

  // Calculate running totals
  const inventoryWithRunningTotal = useMemo(() => {
    if (!filteredInventoryData?.length) return [];

    // 1. ดึงค่า stk_qty จาก bill โดยตรง (ถ้ามี)
    const currentStockQty = Number(bill.stk_qty || 0);
    console.log("Current stock qty from API:", currentStockQty);

    // 2. หา begin_qty ล่าสุด
    const beginRecord = billDetails
      .filter((record) => record.begin_qty && record.m_date_begin)
      .sort((a, b) => {
        const dateA = parseDate(a.m_date_begin);
        const dateB = parseDate(b.m_date_begin);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      })[0];

    const beginQty = Number(beginRecord?.begin_qty || 0);
    console.log("Begin qty from record:", beginQty);

    // 3. รวบรวมทุก transaction (ไม่เฉพาะที่กรองด้วยวันที่) และเรียงตามวันที่
    const allTransactions = [...billDetails]
      .map((item) => ({
        ...item,
        date: parseDate(item.M_DATE),
        qty: Number(item.M_QTY || 0),
      }))
      .filter((item) => item.date) // กรองเอาเฉพาะรายการที่มีวันที่ถูกต้อง
      .sort((a, b) => {
        // เรียงตามวันที่จากเก่าไปใหม่
        const timeA = a.date.getTime();
        const timeB = b.date.getTime();
        if (timeA === timeB) return Number(a.M_ID) - Number(b.M_ID);
        return timeA - timeB;
      });

    console.log("All transactions count:", allTransactions.length);
    
    // 4. คำนวณ running total แบบสะสม
    let runningTotal = beginQty;
    const calculatedData = allTransactions.map((item) => {
      const change = Number(item.M_QTY || 0);
      runningTotal += change;
      return {
        ...item,
        running_total: runningTotal,
      };
    });
    
    const finalCalculatedTotal = runningTotal;
    
    console.log("Final running total:", runningTotal);
    console.log("Filtered inventory data count:", filteredInventoryData.length);
    
    // สร้างข้อความ debug เพื่อแสดงในรูปแบบคอนโซล
    console.log("DEBUG INFO:");
    console.log("1. API Stock Qty (bill.stk_qty):", bill.stk_qty);
    console.log("2. Total transactions in API:", billDetails.length);
    console.log("3. Filtered transactions (by date):", filteredInventoryData.length);
    console.log("4. Calculated final qty:", runningTotal);
    console.log("5. Date filter:", dateFilter);
    
    if (Math.abs(currentStockQty - runningTotal) > 0.01) {
      console.warn("MISMATCH: Stock qty from API doesn't match calculated value!");
      console.warn(`API: ${currentStockQty}, Calculated: ${runningTotal}`);
      console.warn("This may indicate that some transactions are being filtered out by date");
    }

    // 5. นำค่า running total ไปใส่ในข้อมูลที่จะแสดงผล
    const displayData = filteredInventoryData.map((item) => {
      // หาค่า running total จากข้อมูลที่คำนวณไว้
      const matchingRecord = calculatedData.find(
        (calc) => calc.M_ID === item.id
      );
      return {
        ...item,
        quantity_remaining: matchingRecord?.running_total || 0,
        debug_info: {
          id: item.id,
          date: item.date_time,
          begin_qty: beginQty,
          change: Number(item.quantity_sold),
          final: matchingRecord?.running_total || 0,
        },
      };
    });

    // 6. เรียงข้อมูลสำหรับแสดงผล (ใหม่ไปเก่า)
    return displayData
      .sort((a, b) => {
        const timeA = a.parsedDate.getTime();
        const timeB = b.parsedDate.getTime();

        if (timeA === timeB) {
          // For same timestamps: outbound before inbound
          if (a.quantity_sold < 0 && b.quantity_sold > 0) return 1;
          if (a.quantity_sold > 0 && b.quantity_sold < 0) return -1;
          return Number(b.id) - Number(a.id);
        }
        return timeB - timeA;
      })
      .map((item, index) => ({
        ...item,
        sequence_number: index + 1,
        _totalCount: totalRecordCount, // เพิ่มข้อมูลจำนวนรายการทั้งหมด
        _isFiltered: isFiltered, // เพิ่มสถานะว่ามีการกรองหรือไม่
        _apiStockQty: currentStockQty, // เพิ่มค่า Stock QTY จาก API
        _calculatedTotal: finalCalculatedTotal // เพิ่มค่าที่คำนวณได้จากทุกรายการ
      }));
  }, [filteredInventoryData, billDetails, dateFilter, bill.stk_qty, totalRecordCount, isFiltered]);

  // Handlers
  const handleDateChange = (field, value) => {
    setDateFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // เพิ่มฟังก์ชันสำหรับรีเซ็ตตัวกรองวันที่ (แสดงทั้งหมด)
// เพิ่มฟังก์ชันสำหรับรีเซ็ตตัวกรองวันที่ (แสดงทั้งหมด)
const handleFilterReset = () => {
  // แทนที่จะใช้วันที่ปัจจุบันและลบไป 5 ปี
  // ให้หาวันที่เก่าที่สุดและใหม่ที่สุดจากข้อมูลทั้งหมด
  if (billDetails && billDetails.length > 0) {
    // ค้นหาวันที่เก่าที่สุดและใหม่ที่สุดจากข้อมูลทั้งหมด
    const sortedDates = billDetails
      .map(item => parseDate(item.M_DATE))
      .filter(Boolean)
      .sort((a, b) => a - b); // เรียงจากเก่าไปใหม่
      
    if (sortedDates.length > 0) {
      // หาวันแรกของเดือนในวันที่เก่าที่สุด
      const oldestDate = sortedDates[0];
      // หาวันสุดท้ายของเดือนในวันที่ใหม่ล่าสุด
      const latestDate = sortedDates[sortedDates.length - 1];
      
      // ตั้งค่าวันที่ให้ครอบคลุมข้อมูลทั้งหมด
      // ตั้งวันเริ่มต้นให้เป็นวันแรกของเดือนที่เก่าที่สุด
      const startDate = new Date(
        oldestDate.getFullYear(),
        oldestDate.getMonth(),
        1
      );
      
      // ตั้งวันสิ้นสุดให้เป็นวันสุดท้ายของเดือนที่ใหม่ที่สุด
      const endDate = new Date(
        latestDate.getFullYear(),
        latestDate.getMonth() + 1,
        0  // วันที่ 0 ของเดือนถัดไป = วันสุดท้ายของเดือนปัจจุบัน
      );
      
      // ตั้งเวลาให้ครอบคลุมทั้งวัน
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      // ตั้งค่าตัวกรองวันที่
      setDateFilter({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      return; // จบการทำงานเมื่อตั้งค่าเรียบร้อย
    }
  }
  
  // กรณีไม่มีข้อมูล ให้ใช้ค่าเริ่มต้นเดิม
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 5);
  
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);
  
  setDateFilter({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  });
};

  // เพิ่มฟังก์ชันสำหรับแสดงเฉพาะเดือนล่าสุด
  const handleShowLatestMonth = () => {
    if (billDetails.length > 0) {
      const latestMonth = getLatestMonthAndYear(billDetails);
      if (latestMonth) {
        setDateFilter({
          startDate: latestMonth.startDate.toISOString().split('T')[0],
          endDate: latestMonth.endDate.toISOString().split('T')[0]
        });
      }
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleExport = () => {
    exportToExcel(
      inventoryWithRunningTotal, 
      bill, 
      dateFilter,
      sortDirection  // Pass the current sort direction
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/50 z-50">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 sm:rounded-t-2xl px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-white/20 rounded animate-pulse" />
                <div className="h-2 w-32 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-6 w-32 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Loading Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4 bg-white p-6 rounded-2xl shadow-xl">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-200 animate-spin" />
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-t-4 border-blue-600 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">Loading Data</p>
                <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the bill cards items...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-gray-900/45 transition-opacity"
        onClick={handleClose}
      />

      {/* Desktop View */}
      <div
        className={`hidden md:flex items-center justify-center min-h-screen p-4 animate__animated animate__faster ${
          isClosing ? "animate__zoomOut" : "animate__zoomIn"
        }`}
      >
        <div className="relative w-11/12 max-w-6xl max-h-[90vh] bg-gray-100 rounded-2xl shadow-xl">
          <Header
            recordCount={inventoryWithRunningTotal.length}
            totalRecordCount={totalRecordCount}
            onClose={handleClose}
          />

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-4">
                <PartCard
                  partNumber={bill.M_PART_NUMBER}
                  description={bill.M_PART_DESCRIPTION}
                  image={bill.M_PART_IMG}
                />
                <PartInfo
                  partNumber={bill.M_PART_NUMBER}
                  description={bill.M_PART_DESCRIPTION}
                  customer={bill.M_SUBINV}
                  stk_qty={bill.stk_qty}
                  calculatedTotal={inventoryWithRunningTotal[0]?._calculatedTotal}
                  isFiltered={isFiltered}
                />
              </div>

              <div className="col-span-2 space-y-4">
                <DateFilter
                  dateFilter={dateFilter}
                  onDateChange={handleDateChange}
                  onExport={handleExport}
                  onFilterReset={handleFilterReset}
                  onShowLatestMonth={handleShowLatestMonth}
                  isFiltered={isFiltered}
                />
                <InventoryTable 
                  inventory={inventoryWithRunningTotal} 
                  sortDirection={sortDirection}
                  onSortDirectionChange={setSortDirection}
                  onFilterReset={handleFilterReset}
                  isFiltered={isFiltered}
                  apiStockQty={bill.stk_qty}
                  calculatedTotal={inventoryWithRunningTotal[0]?._calculatedTotal}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <MobileView
        bill={bill}
        inventoryWithRunningTotal={inventoryWithRunningTotal}
        dateFilter={dateFilter}
        onDateChange={handleDateChange}
        onClose={handleClose}
        handleExport={handleExport}
        isClosing={isClosing}
        onFilterReset={handleFilterReset}
        onShowLatestMonth={handleShowLatestMonth}
        totalRecordCount={totalRecordCount}
        isFiltered={isFiltered}
        apiStockQty={bill.stk_qty}
        calculatedTotal={inventoryWithRunningTotal[0]?._calculatedTotal}
      />
    </div>
  );
};

export default React.memo(BillDetailPopup);