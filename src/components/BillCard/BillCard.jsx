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
import { BlinkBlur } from "react-loading-indicators";

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
  const itemsPerPage = 8;

  // Load data effects
  useEffect(() => {
    const loadInventories = async () => {
      try {
        setIsLoadingInventories(true);
        const invData = await inventoryService.getInventories();
        setInventories(invData);
        if (!selectedSubInv && invData.some((inv) => inv.name === "GP-DAIK")) {
          setSelectedSubInv("GP-DAIK");
        }
      } catch (error) {
        console.error("Failed to load inventories:", error);
      } finally {
        setIsLoadingInventories(false);
      }
    };
    loadInventories();
  }, []);

  useEffect(() => {
    const loadBills = async () => {
      try {
        setIsLoadingBills(true);
        const data = await billCardService.getBillCards(selectedSubInv);
        setBills(data);
      } catch (error) {
        console.error("Failed to load bills:", error);
      } finally {
        setIsLoadingBills(false);
      }
    };
    loadBills();
  }, [selectedSubInv]);

  // Callbacks
  const handleSubInvChange = useCallback(
    (subInv) => {
      billCardService.clearCache(selectedSubInv);
      setSelectedSubInv(subInv);
      setCurrentPage(1);
      setSelectedBills([]);
    },
    [selectedSubInv]
  );

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

  // Memoized data calculations
  const totalQuantityByPart = useMemo(() => {
    const totals = new Map();
    if (!bills?.length) return totals;

    bills.forEach((bill) => {
      const partNumber = bill.M_PART_NUMBER;
      if (!partNumber) return;
      const currentTotal = totals.get(partNumber) || 0;
      totals.set(partNumber, currentTotal + Number(bill.M_QTY || 0));
    });

    return totals;
  }, [bills]);

  const rawFilteredBills = useBillFilter(bills, search, dateFilter);

  const filteredBills = useMemo(() => {
    if (!rawFilteredBills) return [];
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
        allRelatedBills: bills.filter(
          (b) => b.M_PART_NUMBER === bill.M_PART_NUMBER
        ),
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
      const dataToExport =
        selectedBills.length > 0 ? selectedBills : groupedBills;
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
        <BlinkBlur color="#4F46E5" size="small" text="" textColor="" />
          <p className="text-gray-600">Loading data...</p>
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
