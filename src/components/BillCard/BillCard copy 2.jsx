// components/BillCard/BillCard.jsx
import React, { useState, useCallback, useEffect } from "react";
import BillSearch from "./Search/view/BillSearch";
import BillTable from "./Table/view/BillTable";
import Pagination from "../Pagination/Pagination";
import { exportPartListToExcel } from "../../utils/exportUtils";
import { inventoryService } from "../../services/inventoryService";
import { billCardService } from "../../services/billCardService";
import debounce from "lodash/debounce";
import { BlinkBlur } from "react-loading-indicators";

const BillCard = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBills, setSelectedBills] = useState([]);
  const [dateFilter, setDateFilter] = useState(null);
  const [selectedTableRows, setSelectedTableRows] = useState([]);
  const [selectedSubInv, setSelectedSubInv] = useState("GP-DAIK");
  const [inventories, setInventories] = useState([]);
  const [billsData, setBillsData] = useState({
    data: [],
    pagination: {
      current_page: 1,
      total_pages: 1,
      total_items: 0,
      per_page: 10
    }
  });
  const [isLoadingInventories, setIsLoadingInventories] = useState(true);
  const [isLoadingBills, setIsLoadingBills] = useState(true);

  // โหลดข้อมูล inventories
  useEffect(() => {
    const loadInventories = async () => {
      try {
        setIsLoadingInventories(true);
        const invData = await inventoryService.getInventories();
        setInventories(invData);
      } catch (error) {
        console.error("Failed to load inventories:", error);
      } finally {
        setIsLoadingInventories(false);
      }
    };
    loadInventories();
  }, []);

  // โหลดข้อมูล bills
  useEffect(() => {
    const loadBills = async () => {
      try {
        setIsLoadingBills(true);
        const result = await billCardService.getBillCards(selectedSubInv, null, currentPage);
        setBillsData(result);
      } catch (error) {
        console.error("Failed to load bills:", error);
      } finally {
        setIsLoadingBills(false);
      }
    };
    loadBills();
  }, [selectedSubInv, currentPage]);

  const handleSubInvChange = useCallback((subInv) => {
    billCardService.clearCache(selectedSubInv);
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

  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      setSearch(searchTerm);
      setCurrentPage(1);
      setSelectedBills([]);
    }, 300),
    []
  );

  const handleSearch = useCallback((searchTerm) => {
    debouncedSearch(searchTerm);
  }, [debouncedSearch]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    setSelectedBills([]);
  }, []);

  const exportToExcel = useCallback(async () => {
    try {
      const dataToExport = selectedBills.length > 0 ? selectedBills : billsData.data;
      await exportPartListToExcel(dataToExport);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [selectedBills, billsData]);

  if (isLoadingInventories || isLoadingBills) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <BlinkBlur color="#dd1414" size="small" text="" textColor="" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto sm:px-6 lg:px-8 md:py-6 overflow-y-auto h-screen">
        <div className="bg-white shadow-sm rounded-3xl mb-20">
          <div className="lg:p-6 text-gray-900">
            <div className="sticky top-0 z-10">
              <BillSearch
                onSearch={handleSearch}
                onExport={exportToExcel}
                bills={billsData.data}
                inventories={inventories}
                onFilterChange={handleFilterChange}
                onSelectSubInv={handleSubInvChange}
                selectedSubInv={selectedSubInv}
                isFiltered={!!dateFilter}
                defaultDates={dateFilter}
                filteredBills={billsData.data}
                selectedTableRows={selectedTableRows}
              />
            </div>

            <div className="sm:mt-6">
              <BillTable
                bills={billsData.data}
                onSelectedRowsChange={handleSelectedRowsChange}
                key={`${currentPage}-${dateFilter?.startDate}-${dateFilter?.endDate}-${selectedSubInv}-${search}`}
              />
            </div>

            <div className="mt-6">
              <Pagination
                totalPages={billsData.pagination.total_pages}
                currentPage={billsData.pagination.current_page}
                totalItems={billsData.pagination.total_items}
                onPageChange={handlePageChange}
                itemsPerPage={billsData.pagination.per_page}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BillCard);