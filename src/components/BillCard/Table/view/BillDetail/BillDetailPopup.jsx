import React, { useState, useEffect, useMemo } from "react";
import { billCardService } from "../../../../../services/billCardService";
import Swal from "sweetalert2";
import { parseDate } from "../../../../../utils/dateUtils";

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

        // Set initial date filter
        if (details.length > 0) {
          const sortedDates = details
            .map((item) => parseDate(item.M_DATE))
            .filter(Boolean)
            .sort((a, b) => b - a);

          if (sortedDates.length > 0) {
            const latestDate = sortedDates[0];
            const startDate = new Date(
              latestDate.getFullYear(),
              latestDate.getMonth(),
              1
            );
            const endDate = new Date(
              latestDate.getFullYear(),
              latestDate.getMonth() + 1,
              0
            );

            setDateFilter({
              startDate: startDate.toISOString().split("T")[0],
              endDate: endDate.toISOString().split("T")[0],
            });
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
      return inventoryData;
    }

    const startDate = new Date(dateFilter.startDate);
    const endDate = new Date(dateFilter.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return inventoryData.filter((item) => {
      const itemDate = item.parsedDate;
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [inventoryData, dateFilter]);

  // Calculate running totals
  const inventoryWithRunningTotal = useMemo(() => {
    if (!filteredInventoryData?.length) return [];

    // 1. หา begin_qty ล่าสุด
    const beginRecord = billDetails
      .filter((record) => record.begin_qty && record.m_date_begin)
      .sort((a, b) => {
        const dateA = parseDate(a.m_date_begin);
        const dateB = parseDate(b.m_date_begin);
        if (!dateA || !dateB) return 0;
        return dateA.getTime() - dateB.getTime();
      })[0];

    const beginQty = Number(beginRecord?.begin_qty || 0);

    // 2. รวบรวมทุก transaction และเรียงตามวันที่
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

    // 3. คำนวณ running total แบบสะสม
    let runningTotal = beginQty;
    const calculatedData = allTransactions.map((item) => {
      const change = Number(item.M_QTY || 0);
      runningTotal += change;
      return {
        ...item,
        running_total: runningTotal,
      };
    });

    // 4. นำค่า running total ไปใส่ในข้อมูลที่จะแสดงผล
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

    // 5. เรียงข้อมูลสำหรับแสดงผล (ใหม่ไปเก่า)
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
      }));
  }, [filteredInventoryData, billDetails]);

  // Handlers
  const handleDateChange = (field, value) => {
    setDateFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
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
                />
              </div>

              <div className="col-span-2 space-y-4">
                <DateFilter
                  dateFilter={dateFilter}
                  onDateChange={handleDateChange}
                  onExport={handleExport}
                />
                  <InventoryTable 
    inventory={inventoryWithRunningTotal} 
    sortDirection={sortDirection}
    onSortDirectionChange={setSortDirection}  // Optional: to update sort direction from table
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
      />
    </div>
  );
};

export default React.memo(BillDetailPopup);
