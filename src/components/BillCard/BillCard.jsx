// BillCard.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import BillSearch from "./Search/view/BillSearch";
import BillTable from "./Table/view/BillTable";
import Pagination from "../Pagination/Pagination";
import { parseDate } from "../../utils/dateUtils";
import { exportPartListToExcel } from "../../utils/exportUtils";
import { useBillFilter } from "../../hooks/useBillFilter";
import { useBillDataAPI } from "../../hooks/useBillDataAPI";
import { inventoryService } from "../../services/inventoryService";

const BillCard = () => {
  // States
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBills, setSelectedBills] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [selectedTableRows, setSelectedTableRows] = useState([]);
  const [selectedSubInv, setSelectedSubInv] = useState("GP-DAIK");
  const [groupedInventories, setGroupedInventories] = useState([]);
  const [isLoadingGrouped, setIsLoadingGrouped] = useState(true);
  const [error, setError] = useState(null);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const itemsPerPage = 8;

  // Fetch Bills using custom hook
  const { 
    bills, 
    loading: isLoadingBills, 
    error: billError, 
    refreshBills,
    setSubInventory,
    selectedItemId,
    setSelectedItemId
  } = useBillDataAPI("GP-DAIK");

  // Load grouped inventories
  useEffect(() => {
    const loadGroupedInventories = async () => {
      try {
        setIsLoadingGrouped(true);
        setError(null);
        const data = await inventoryService.fetchInventories();
        setGroupedInventories(data);

        if (!selectedSubInv) {
          const defaultGroup = data.find(group => group.secondary_inventory === "GP-DAIK");
          if (defaultGroup) {
            setSelectedSubInv("GP-DAIK");
          }
        }
      } catch (error) {
        console.error("Failed to load grouped inventories:", error);
        setError("Failed to load grouped inventories");
      } finally {
        setIsLoadingGrouped(false);
      }
    };

    loadGroupedInventories();
  }, []);

  // Optimized callbacks
  const handleSubInvChange = useCallback(async (subInv) => {
    if (subInv !== selectedSubInv) {
      setIsTableLoading(true);
      try {
        inventoryService.clearCache();
        setSelectedSubInv(subInv);
        await setSubInventory(subInv);
        setCurrentPage(1);
        setSelectedBills([]);
        setSelectedTableRows([]);
        setError(null);
      } finally {
        // Add small delay to ensure loading animation is visible
        setTimeout(() => {
          setIsTableLoading(false);
        }, 800);
      }
    }
  }, [selectedSubInv, setSubInventory]);

  const handleItemIdChange = useCallback((itemId) => {
    if (itemId !== selectedItemId) {
      setSelectedItemId(itemId);
      setCurrentPage(1);
      setSelectedBills([]);
      setSelectedTableRows([]);
    }
  }, [selectedItemId, setSelectedItemId]);

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
    () => debounce((searchTerm) => {
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
        .filter(item => item.date && !isNaN(item.date.getTime()))
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
        stk_qty: sortedBills[0].stk_qty || "0" ,
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
  if (isLoadingGrouped || (isLoadingBills && selectedItemId)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 animate-spin"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-t-4 border-blue-600 animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || billError) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-red-400">error</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{!selectedItemId ? "Please select an Item ID" : (error || billError)}</p>
                </div>
                {!selectedItemId && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      To view bill cards, please:
                    </p>
                    <ol className="list-decimal list-inside text-sm text-gray-600">
                      <li>Select a SubInventory</li>
                      <li>Select a specific Item ID</li>
                    </ol>
                  </div>
                )}
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
          <div className="lg:p-6 text-gray-900">
            {/* Search Section */}
            <div className="sticky top-0 z-10">
              <BillSearch
                onSearch={handleSearch}
                onExport={exportToExcel}
                inventories={groupedInventories.map(group => ({
                  name: group.secondary_inventory,
                  description: group.description,
                  inventory_items: group.inventory_items
                }))}
                onFilterChange={handleFilterChange}
                onSelectSubInv={handleSubInvChange}
                onSelectItemId={handleItemIdChange}
                selectedSubInv={selectedSubInv}
                selectedItemId={selectedItemId}
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
                key={`${currentPage}-${dateFilter?.startDate}-${dateFilter?.endDate}-${selectedSubInv}-${selectedItemId}-${search}`}
                allBills={bills}
                isLoading={isTableLoading}
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