// BillDetailPopup.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Header } from './Header';
import { PartCard } from './PartCard';
import { PartInfo } from './PartInfo';
import { DateFilter } from './DateFilter';
import { InventoryTable } from './InventoryTable';
import { exportToExcel } from './utils/exportToExcel';
import { MobileView } from "./MobileView/MobileView";
import { parseDate } from "../../../../../utils/dateUtils";

const BillDetailPopup = ({ bill, onClose }) => {
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [isClosing, setIsClosing] = useState(false);

  // Set initial date filter
  useEffect(() => {
    if (bill?.allRelatedBills?.length > 0) {
      // หาวันที่ล่าสุดจากข้อมูล
      const sortedDates = bill.allRelatedBills
        .map(item => parseDate(item.M_DATE))
        .filter(Boolean)
        .sort((a, b) => b - a);

      if (sortedDates.length > 0) {
        const latestDate = sortedDates[0];
        const startDate = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
        const endDate = new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 0);

        setDateFilter({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });
      }
    }
  }, [bill?.allRelatedBills]);

  // Process and sort inventory data
  const inventoryData = useMemo(() => {
    if (!bill?.allRelatedBills?.length) return [];

    return bill.allRelatedBills
      .map(item => {
        const parsedDate = parseDate(item.M_DATE);
        if (!parsedDate) return null;

        return {
          id: item.M_ID,
          numericId: Number(item.M_ID),
          date_time: item.M_DATE,
          quantity_sold: Number(item.M_QTY || 0),
          transaction_type: item.TRANSACTION_TYPE_NAME,
          username: item.M_USER_NAME,
          source_name: item.M_SOURCE_NAME || '-',
          begin_qty: Number(item.begin_qty || 0),
          m_date_begin: item.m_date_begin,
          parsedDate
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.parsedDate.getTime() === b.parsedDate.getTime()) {
          return a.numericId - b.numericId;
        }
        return a.parsedDate.getTime() - b.parsedDate.getTime();
      });
  }, [bill?.allRelatedBills]);

  // Filter inventory based on date range
  const filteredInventoryData = useMemo(() => {
    if (!inventoryData.length || !dateFilter.startDate || !dateFilter.endDate) {
      return inventoryData;
    }

    const startDate = new Date(dateFilter.startDate);
    const endDate = new Date(dateFilter.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return inventoryData.filter(item => {
      const itemDate = item.parsedDate;
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [inventoryData, dateFilter]);

  // Calculate running totals
const inventoryWithRunningTotal = useMemo(() => {
  if (!filteredInventoryData?.length) return [];

  // 1. หา begin_qty ล่าสุด
  const beginRecord = bill.allRelatedBills
    .filter(record => record.begin_qty && record.m_date_begin)
    .sort((a, b) => {
      const dateA = parseDate(a.m_date_begin);
      const dateB = parseDate(b.m_date_begin);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    })[0];

  const beginQty = Number(beginRecord?.begin_qty || 0);

  // 2. รวบรวมทุก transaction และเรียงตามวันที่
  const allTransactions = [...bill.allRelatedBills]
    .map(item => ({
      ...item,
      date: parseDate(item.M_DATE),
      qty: Number(item.M_QTY || 0)
    }))
    .filter(item => item.date)  // กรองเอาเฉพาะรายการที่มีวันที่ถูกต้อง
    .sort((a, b) => {
      // เรียงตามวันที่จากเก่าไปใหม่
      const timeA = a.date.getTime();
      const timeB = b.date.getTime();
      if (timeA === timeB) return Number(a.M_ID) - Number(b.M_ID);
      return timeA - timeB;
    });

  // 3. คำนวณ running total แบบสะสม
  let runningTotal = beginQty;
  const calculatedData = allTransactions.map(item => {
    const change = Number(item.M_QTY || 0);
    runningTotal += change;
    return {
      ...item,
      running_total: runningTotal
    };
  });

  // 4. นำค่า running total ไปใส่ในข้อมูลที่จะแสดงผล
  const displayData = filteredInventoryData.map(item => {
    // หาค่า running total จากข้อมูลที่คำนวณไว้
    const matchingRecord = calculatedData.find(calc => calc.M_ID === item.id);
    return {
      ...item,
      quantity_remaining: matchingRecord?.running_total || 0,
      debug_info: {
        id: item.id,
        date: item.date_time,
        begin_qty: beginQty,
        change: Number(item.quantity_sold),
        final: matchingRecord?.running_total || 0
      }
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
      sequence_number: index + 1
    }));

}, [filteredInventoryData, bill?.allRelatedBills]);

  // Handlers
  const handleDateChange = (field, value) => {
    setDateFilter(prev => ({
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
    exportToExcel(inventoryWithRunningTotal, bill, dateFilter);
  };

  if (!bill || !bill.relatedBills) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-gray-900/45 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Desktop View */}
      <div className={`hidden md:flex items-center justify-center min-h-screen p-4 animate__animated animate__faster ${
        isClosing ? "animate__zoomOut" : "animate__zoomIn"
      }`}>
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