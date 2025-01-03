import React, { useState, useCallback, useMemo } from "react";
import BillSearch from "./Search/view/BillSearch";
import BillTable from "./Table/view/BillTable";
import Pagination from "../Pagination/Pagination";
import { parseDate } from "../../utils/dateUtils";
import { exportBillsToExcel } from "../../utils/exportUtils";
import { useBillFilter } from "../../hook/useBillFilter";
import debounce from "lodash/debounce";

const BillCard = ({ bills }) => {
  // States
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBills, setSelectedBills] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [selectedTableRows, setSelectedTableRows] = useState([]);
  const itemsPerPage = 8;

  // คำนวณยอดรวมทั้งหมดแยกตาม part number
  const totalQuantityByPart = useMemo(() => {
    const totals = new Map();
    
    bills.forEach(bill => {
      const partNumber = bill.M_PART_NUMBER;
      if (!partNumber) return;
      
      const currentTotal = totals.get(partNumber) || 0;
      totals.set(partNumber, currentTotal + Number(bill.M_QTY || 0));
    });
    
    return totals;
  }, [bills]);

  // ใช้ filter hook สำหรับการแสดงผลตาม filter
  const filteredBills = useBillFilter(bills, search, dateFilter);

  // Group bills และรวมข้อมูลยอดรวมทั้งหมด
  const groupedBills = useMemo(() => {
    const partMap = new Map();

    filteredBills.forEach((bill) => {
      if (!partMap.has(bill.M_PART_NUMBER)) {
        const relatedBills = filteredBills.filter(
          (b) => b.M_PART_NUMBER === bill.M_PART_NUMBER
        );

        const sortedBills = relatedBills.sort((a, b) => {
          const dateA = parseDate(a.M_DATE);
          const dateB = parseDate(b.M_DATE);
          if (!dateA || !dateB) return 0;
          return dateB.getTime() - dateA.getTime();
        });

        // ยอดรวมจาก bills ที่ผ่าน filter
        const filteredTotal = relatedBills.reduce(
          (sum, b) => sum + Number(b.M_QTY || 0),
          0
        );

        // ยอดรวมทั้งหมดจากทุก bills
        const totalQuantity = totalQuantityByPart.get(bill.M_PART_NUMBER) || 0;

        partMap.set(bill.M_PART_NUMBER, {
          ...sortedBills[0],
          totalQty: totalQuantity, // ยอดรวมทั้งหมดในระบบ
          filteredQty: filteredTotal, // ยอดรวมตาม filter
          billCount: relatedBills.length,
          relatedBills: sortedBills,
          latestDate: parseDate(sortedBills[0].M_DATE),
          allRelatedBills: bills.filter(b => b.M_PART_NUMBER === bill.M_PART_NUMBER) // เก็บ bills ทั้งหมดไว้ด้วย
        });
      }
    });

    return Array.from(partMap.values()).sort((a, b) => {
      const dateA = a.latestDate;
      const dateB = b.latestDate;
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredBills, totalQuantityByPart, bills]);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      setSearch(searchTerm);
      setCurrentPage(1);
      setSelectedBills([]);
    }, 300),
    []
  );

  const handleSearch = useCallback(
    (searchTerm) => {
      debouncedSearch(searchTerm);
    },
    [debouncedSearch]
  );

  const handleSelectedRowsChange = useCallback((selectedRows) => {
    requestAnimationFrame(() => {
      setSelectedBills(selectedRows);
      setSelectedTableRows(selectedRows);
    });
  }, []);

  const handleFilterChange = useCallback((dateRange) => {
    setDateFilter(dateRange);
    setCurrentPage(1);
    setSelectedBills([]);
  }, []);

  const exportToExcel = useCallback(async () => {
    try {
      const dataToExport = selectedBills.length > 0 ? selectedBills : groupedBills;
      await exportBillsToExcel(dataToExport);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [groupedBills, selectedBills]);

  // Pagination calculations
  const totalItems = groupedBills.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastBill = currentPage * itemsPerPage;
  const indexOfFirstBill = indexOfLastBill - itemsPerPage;
  const currentBills = groupedBills.slice(indexOfFirstBill, indexOfLastBill);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        setSelectedBills([]);
      }
    },
    [totalPages]
  );

  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="overflow-y-auto h-screen">
          <div className="py-12">
            <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
              <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl">
                <div className="p-6 text-gray-900">
                  <BillSearch
                    onSearch={handleSearch}
                    onExport={exportToExcel}
                    bills={bills}
                    onFilterChange={handleFilterChange}
                    isFiltered={!!dateFilter}
                    defaultDates={dateFilter}
                    filteredBills={groupedBills}
                    selectedTableRows={selectedTableRows}
                  />
                  <BillTable
                    bills={currentBills}
                    startingIndex={indexOfFirstBill}
                    onSelectedRowsChange={handleSelectedRowsChange}
                    key={`${currentPage}-${dateFilter?.startDate}-${dateFilter?.endDate}`}
                    allBills={bills}
                  />
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="h-screen flex flex-col overflow-hidden">
          <div className="sticky top-0 bg-white z-10 shadow-sm">
            <BillSearch
              onSearch={handleSearch}
              onExport={exportToExcel}
              bills={bills}
              onFilterChange={handleFilterChange}
              isFiltered={!!dateFilter}
              defaultDates={dateFilter}
              selectedTableRows={selectedTableRows}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-8xl mx-auto sm:px-6 lg:px-8">
              <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="text-gray-900">
                  <BillTable
                    bills={currentBills}
                    startingIndex={indexOfFirstBill}
                    onSelectedRowsChange={handleSelectedRowsChange}
                    key={`${currentPage}-${search}-${dateFilter?.startDate}-${dateFilter?.endDate}`}
                    allBills={bills}
                  />
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    totalItems={totalItems}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillCard;