// components/BillCard/BillCard.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import BillSearch from "./Search/view/BillSearch";
import BillTable from "./Table/view/BillTable";
import Pagination from "../Pagination/Pagination";
import { parseDate } from "../../utils/dateUtils";
import { exportPartListToExcel } from "../../utils/exportUtils";
import { useBillFilter } from "../../hook/useBillFilter";
import { inventoryService } from "../../services/inventoryService";
import { billCardService } from "../../services/billCardService";
import debounce from "lodash/debounce";

const BillCard = () => {
  // States
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBills, setSelectedBills] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [selectedTableRows, setSelectedTableRows] = useState([]);
  const [selectedSubInv, setSelectedSubInv] = useState('GP-DAIK');
  const [inventories, setInventories] = useState([]);
  const [bills, setBills] = useState([]);
  const [isLoadingInventories, setIsLoadingInventories] = useState(true);
  const [isLoadingBills, setIsLoadingBills] = useState(true);
  const itemsPerPage = 8;

  // Load inventories when component mounts
  useEffect(() => {
    const loadInventories = async () => {
      try {
        setIsLoadingInventories(true);
        const invData = await inventoryService.getInventories();
        setInventories(invData);
        
        // Set GP-DAIK as default if available
        if (!selectedSubInv && invData.some(inv => inv.name === "GP-DAIK")) {
          setSelectedSubInv("GP-DAIK");
        }
      } catch (error) {
        console.error('Failed to load inventories:', error);
      } finally {
        setIsLoadingInventories(false);
      }
    };
    loadInventories();
  }, []);

  // Load bills when subInventory changes
  useEffect(() => {
    const loadBills = async () => {
      try {
        setIsLoadingBills(true);
        const data = await billCardService.getBillCards(selectedSubInv);
        setBills(data);
      } catch (error) {
        console.error('Failed to load bills:', error);
      } finally {
        setIsLoadingBills(false);
      }
    };

    loadBills();
  }, [selectedSubInv]);

  // Callbacks
  const handleSubInvChange = useCallback((subInv) => {
    billCardService.clearCache(selectedSubInv); // ล้าง cache เมื่อเปลี่ยน subInv
    setSelectedSubInv(subInv);
    setCurrentPage(1);
    setSelectedBills([]);
  }, [selectedSubInv]);

  const handleFilterChange = useCallback((dateRange) => {
    setDateFilter(dateRange);
    setCurrentPage(1);
    setSelectedBills([]);
  }, []);

  const handleSelectedRowsChange = useCallback((selectedRows) => {
    setSelectedBills(selectedRows);
    setSelectedTableRows(selectedRows);
  }, []);

  const debouncedSearch = useMemo(
    () =>
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

  // Memoized data
  const totalQuantityByPart = useMemo(() => {
    const totals = new Map();
    if (!bills?.length) return totals;
    
    bills.forEach(bill => {
      const partNumber = bill.M_PART_NUMBER;
      if (!partNumber) return;
      
      const currentTotal = totals.get(partNumber) || 0;
      totals.set(partNumber, currentTotal + Number(bill.M_QTY || 0));
    });
    
    return totals;
  }, [bills]);

  // Filtered and grouped data
  const rawFilteredBills = useBillFilter(bills, search, dateFilter);

  const filteredBills = useMemo(() => {
    if (!rawFilteredBills) return [];
    // ไม่ต้อง filter ด้วย subInventory อีกเพราะข้อมูลถูก filter มาแล้วจาก API
    return rawFilteredBills;
  }, [rawFilteredBills]);

  const groupedBills = useMemo(() => {
    if (!filteredBills?.length) return [];
    const partMap = new Map();

    filteredBills.forEach((bill) => {
      if (!bill?.M_PART_NUMBER || partMap.has(bill.M_PART_NUMBER)) return;

      const relatedBills = filteredBills.filter(
        (b) => b.M_PART_NUMBER === bill.M_PART_NUMBER
      );

      const sortedBills = relatedBills.sort((a, b) => {
        const dateA = parseDate(a.M_DATE);
        const dateB = parseDate(b.M_DATE);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      });

      const filteredTotal = relatedBills.reduce(
        (sum, b) => sum + Number(b.M_QTY || 0),
        0
      );

      const totalQuantity = totalQuantityByPart.get(bill.M_PART_NUMBER) || 0;

      partMap.set(bill.M_PART_NUMBER, {
        ...sortedBills[0],
        totalQty: totalQuantity,
        filteredQty: filteredTotal,
        billCount: relatedBills.length,
        relatedBills: sortedBills,
        latestDate: parseDate(sortedBills[0].M_DATE),
        allRelatedBills: bills.filter(b => b.M_PART_NUMBER === bill.M_PART_NUMBER)
      });
    });

    return Array.from(partMap.values()).sort((a, b) => {
      const dateA = a.latestDate;
      const dateB = b.latestDate;
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredBills, totalQuantityByPart, bills]);

  // Export handler
  const exportToExcel = useCallback(async () => {
    try {
      const dataToExport = selectedBills.length > 0 ? selectedBills : groupedBills;
      await exportPartListToExcel(dataToExport);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [selectedBills, groupedBills]);

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

  // Loading state
  if (isLoadingInventories || isLoadingBills) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

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
                    inventories={inventories}
                    onFilterChange={handleFilterChange}
                    onSelectSubInv={handleSubInvChange}
                    selectedSubInv={selectedSubInv}
                    isFiltered={!!dateFilter}
                    defaultDates={dateFilter}
                    filteredBills={groupedBills}
                    selectedTableRows={selectedTableRows}
                  />
                  <BillTable
                    bills={currentBills}
                    startingIndex={indexOfFirstBill}
                    onSelectedRowsChange={handleSelectedRowsChange}
                    key={`${currentPage}-${dateFilter?.startDate}-${dateFilter?.endDate}-${selectedSubInv}`}
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
              inventories={inventories}
              onFilterChange={handleFilterChange}
              onSelectSubInv={handleSubInvChange}
              selectedSubInv={selectedSubInv}
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
                    key={`${currentPage}-${search}-${dateFilter?.startDate}-${dateFilter?.endDate}-${selectedSubInv}`}
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