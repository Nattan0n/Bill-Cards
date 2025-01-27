// BillCard.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { BlinkBlur } from "react-loading-indicators";
import debounce from "lodash/debounce";
import BillSearch from "./Search/view/BillSearch";
import BillTable from "./Table/view/BillTable";
import Pagination from "../Pagination/Pagination";
import { parseDate } from "../../utils/dateUtils";
import { exportPartListToExcel } from "../../utils/exportUtils";
import { useBillFilter } from "../../hook/useBillFilter";
import { inventoryService } from "../../services/inventoryService";
import { billCardService } from "../../services/billCardService";

const BillCard = () => {
  // States
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBills, setSelectedBills] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [selectedTableRows, setSelectedTableRows] = useState([]);
  const [selectedSubInv, setSelectedSubInv] = useState("GP-DAIK");
  const [inventories, setInventories] = useState([]);
  const [bills, setBills] = useState([]);
  const [isLoadingInventories, setIsLoadingInventories] = useState(true);
  const [isLoadingBills, setIsLoadingBills] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 8;

  // Load inventories data
  useEffect(() => {
    const controller = new AbortController();
    
    const loadInventories = async () => {
      try {
        setIsLoadingInventories(true);
        setError(null);
        const invData = await inventoryService.getInventories({ signal: controller.signal });
        if (!controller.signal.aborted) {
          setInventories(invData);
          if (!selectedSubInv && invData.some((inv) => inv.name === "GP-DAIK")) {
            setSelectedSubInv("GP-DAIK");
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load inventories:", error);
          setError("Failed to load inventories");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingInventories(false);
        }
      }
    };

    loadInventories();

    return () => controller.abort();
  }, []);

  // Load bills data
  useEffect(() => {
    const controller = new AbortController();
    
    const loadBills = async () => {
      try {
        setIsLoadingBills(true);
        setError(null);
        const data = await billCardService.getBillCards(selectedSubInv, null, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setBills(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load bills:", error);
          setError("Failed to load bills");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingBills(false);
        }
      }
    };

    loadBills();

    // Auto refresh every 5 minutes if tab is visible
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadBills();
      }
    }, 300000);

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [selectedSubInv]);

  // Optimized callbacks
  const handleSubInvChange = useCallback((subInv) => {
    billCardService.clearCache(selectedSubInv);
    setSelectedSubInv(subInv);
    setCurrentPage(1);
    setSelectedBills([]);
    setSelectedTableRows([]);
  }, [selectedSubInv]);

  const handleFilterChange = useCallback((dateRange) => {
    setDateFilter(dateRange);
    setCurrentPage(1);
    setSelectedBills([]);
    setSelectedTableRows([]);
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
        setSelectedTableRows([]);
      }, 300),
    []
  );

  const handleSearch = useCallback(
    (searchTerm) => {
      debouncedSearch(searchTerm);
    },
    [debouncedSearch]
  );

  // Optimized filtering
  const rawFilteredBills = useBillFilter(bills, search, dateFilter);

  const filteredBills = useMemo(() => {
    if (!rawFilteredBills?.length) return [];
    return rawFilteredBills;
  }, [rawFilteredBills]);

  // Optimized grouping logic
  const groupedBills = useMemo(() => {
    if (!filteredBills?.length) return [];
    
    const partMap = new Map();

    filteredBills.forEach((bill) => {
      if (!bill?.M_PART_NUMBER || partMap.has(bill.M_PART_NUMBER)) return;

      const relatedBills = filteredBills.filter(
        (b) => b.M_PART_NUMBER === bill.M_PART_NUMBER
      );

      const allRelatedBills = bills.filter(
        (b) => b.M_PART_NUMBER === bill.M_PART_NUMBER
      );

      // Find latest begin_qty
      const beginRecord = allRelatedBills
        .filter(record => record.begin_qty && record.m_date_begin)
        .sort((a, b) => {
          const dateA = parseDate(a.m_date_begin);
          const dateB = parseDate(b.m_date_begin);
          if (!dateA || !dateB) return 0;
          return dateB.getTime() - dateA.getTime();
        })[0];

      const beginQty = Number(beginRecord?.begin_qty || 0);

      // Process all transactions
      const allTransactions = [...allRelatedBills]
        .map(item => ({
          ...item,
          date: parseDate(item.M_DATE),
          qty: Number(item.M_QTY || 0)
        }))
        .filter(item => item.date)
        .sort((a, b) => {
          const timeA = a.date.getTime();
          const timeB = b.date.getTime();
          if (timeA === timeB) return Number(a.M_ID) - Number(b.M_ID);
          return timeA - timeB;
        });

      // Calculate running total
      let runningTotal = beginQty;
      allTransactions.forEach(item => {
        runningTotal += item.qty;
      });

      // Sort by date descending for display
      const sortedBills = relatedBills.sort((a, b) => {
        const dateA = parseDate(a.M_DATE);
        const dateB = parseDate(b.M_DATE);
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      });

      partMap.set(bill.M_PART_NUMBER, {
        ...sortedBills[0],
        totalQty: runningTotal,
        billCount: relatedBills.length,
        relatedBills: sortedBills,
        latestDate: parseDate(sortedBills[0].M_DATE),
        allRelatedBills: allRelatedBills,
      });
    });

    return Array.from(partMap.values());
  }, [filteredBills, bills]);

  // Export handler
  const exportToExcel = useCallback(async () => {
    try {
      const dataToExport = selectedBills.length > 0 ? selectedBills : groupedBills;
      await exportPartListToExcel(dataToExport);
    } catch (error) {
      console.error("Export failed:", error);
      setError("Export failed");
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
        setSelectedTableRows([]);
      }
    },
    [totalPages]
  );

  // Loading state
  if (isLoadingInventories || isLoadingBills) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <BlinkBlur color="#dd1414" size="small" text="" textColor="" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-red-400">error</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
<div className="min-h-screen">
      <div className="max-w-8xl mx-auto sm:px-6 lg:px-8 md:py-6 overflow-y-auto h-screen">
        <div className="bg-white shadow-sm rounded-3xl mb-20">
          <div className=" lg:p-6 text-gray-900">
            {/* Search Section */}
            <div className="sticky top-0 z-10">
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
            </div>

            {/* Table Section */}
            <div className="sm:mt-6">
              <BillTable
                bills={currentBills}
                startingIndex={indexOfFirstBill}
                onSelectedRowsChange={handleSelectedRowsChange}
                key={`${currentPage}-${dateFilter?.startDate}-${dateFilter?.endDate}-${selectedSubInv}-${search}`}
                allBills={bills}
              />
            </div>

            {/* Pagination Section */}
            <div className="mt-6">
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
  );
};

export default React.memo(BillCard);