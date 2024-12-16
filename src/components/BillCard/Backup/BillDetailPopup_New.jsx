import React, { useState, useEffect } from "react";
import * as ExcelJS from "exceljs";

const BillDetailPopup = ({ bill, onClose }) => {
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  // Get latest month's start and end dates
  useEffect(() => {
    if (bill?.inventory && bill.inventory.length > 0) {
      const dates = bill.inventory.map((item) => new Date(item.date_time));
      const latestDate = new Date(Math.max(...dates));

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
  }, [bill]);

  // Filter inventory based on date range
  useEffect(() => {
    if (bill?.inventory) {
      const filtered = bill.inventory.filter((item) => {
        const itemDate = new Date(item.date_time);
        const start = dateFilter.startDate
          ? new Date(dateFilter.startDate)
          : null;
        const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

        if (start && end) {
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return itemDate >= start && itemDate <= end;
        }
        return true;
      });

      setFilteredInventory(filtered);
    }
  }, [bill, dateFilter]);

  const handleExport = async () => {
    try {
      if (inventoryWithRemaining.length === 0) {
        alert("ไม่มีข้อมูลที่จะส่งออก");
        return;
      }
  
      console.log('Data to export:', inventoryWithRemaining); // เช็คข้อมูลก่อน export
  
      // สร้าง workbook และ worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Inventory Log");
  
      // เพิ่มส่วนหัวข้อมูลสินค้า
      const titleRow = worksheet.addRow(["Part Details"]);
      titleRow.font = { bold: true, size: 14 };
  
      worksheet.addRow(["Part Number:", bill.M_PART_NUMBER]);
      worksheet.addRow(["Description:", bill.M_PART_DESCRIPTION]);
      worksheet.addRow(["Customer:", bill.M_SUBINV]);
      worksheet.addRow([
        "Date Range:",
        `${dateFilter.startDate} to ${dateFilter.endDate}`,
      ]);
      worksheet.addRow([]); // เว้นบรรทัด
  
      // กำหนดหัวตาราง
      const headers = [
        { header: "ID", key: "id", width: 10 },
        { header: "Date", key: "date", width: 20 },
        { header: "Quantity In/Out", key: "quantity", width: 15 },
        { header: "Plan ID", key: "planId", width: 15 },
        { header: "Remaining", key: "remaining", width: 15 },
        { header: "User", key: "user", width: 20 },
      ];
  
      // เพิ่มหัวตาราง
      const headerRow = worksheet.addRow(headers.map(h => h.header));
  
      // จัดแต่งหัวตาราง
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };
        cell.font = { bold: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
  
      // เพิ่มข้อมูลแบบระบุ column ชัดเจน
      inventoryWithRemaining.forEach((item) => {
        const row = worksheet.addRow([
          item.id,                   // ID
          item.date_time,           // Date
          item.quantity_sold,       // Quantity In/Out
          item.plan_id,             // Plan ID
          item.quantity_remaining,  // Remaining
          item.signature            // User
        ]);
  
        // จัดแต่งแต่ละเซลล์ในแถว
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
      });
  
      // ปรับความกว้างคอลัมน์
      headers.forEach((header, index) => {
        worksheet.getColumn(index + 1).width = header.width;
      });
  
      // สร้างไฟล์และดาวน์โหลด
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Inventory_Log_${
        bill.M_PART_NUMBER
      }_${new Date().toLocaleDateString()}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
  
      alert("ส่งออกข้อมูลสำเร็จ!");
    } catch (error) {
      console.error("Export failed:", error);
      console.log("Error details:", error.message);  // เพิ่ม log error details
      console.log("Data causing error:", inventoryWithRemaining);  // เพิ่ม log ข้อมูลที่ทำให้เกิด error
      alert("เกิดข้อผิดพลาดในการส่งออกข้อมูล กรุณาลองใหม่อีกครั้ง");
    }
  };

  const calculateInventoryWithRemaining = () => {
    let remaining = bill.quantity || 0;
    return filteredInventory.map((item) => {
      const itemWithRemaining = {
        ...item,
        quantity_remaining: Math.max(remaining - (item.quantity_sold || 0), 0),
      };
      remaining -= item.quantity_sold || 0;
      return itemWithRemaining;
    });
  };

  const inventoryWithRemaining = calculateInventoryWithRemaining();

  const handleDateChange = (field, value) => {
    setDateFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!bill) return null;

  return (
    <div>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="fixed inset-0 flex items-center justify-center z-40">
          <div
            className="absolute inset-0 bg-gray-900 dark:bg-gray-900 opacity-75"
            onClick={onClose}
            aria-hidden="true"
          ></div>
          <div
            className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-xl z-10 w-11/12 max-w-6xl max-h-[90vh]"
            role="dialog"
          >
            <div className="h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <span className="material-symbols-outlined mr-2">
                    description
                  </span>
                  Part Details
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 bg-red-600 hover:bg-red-800 rounded-lg text-white transition-colors flex items-center"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
                <div className="flex gap-6 mb-6">
                  {/* Left Column - Image and Part Details */}
                  <div className="w-1/3 space-y-4">
                    {/* Part Image */}
                    <div className="bg-gray-100 rounded-md p-4 shadow-sm">
                      <img
                        src={
                          bill.M_PART_IMG || "https://via.placeholder.com/300"
                        }
                        alt={bill.M_PART_DESCRIPTION}
                        className="w-full h-64 object-cover rounded-md shadow-md"
                      />
                    </div>

                    {/* Part Information */}
                    <div className="bg-gray-100 rounded-md p-4 space-y-3">
                      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                        Part Information
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Part Number
                          </label>
                          <p className="text-gray-800 font-medium">
                            {bill.M_PART_NUMBER}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Description
                          </label>
                          <p className="text-gray-800 font-medium">
                            {bill.M_PART_DESCRIPTION}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Customer
                          </label>
                          <p className="text-gray-800 font-medium">
                            {bill.M_SUBINV}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Date Filters and Table */}
                  <div className="w-2/3 space-y-4">
                    {/* Date Filter Card */}
                    <div className="bg-gray-100 rounded-md p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Date Filter
                        </h3>
                        <button
                          onClick={handleExport}
                          className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined mr-2">
                            file_download
                          </span>
                          Export to Excel
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={dateFilter.startDate}
                            onChange={(e) =>
                              handleDateChange("startDate", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={dateFilter.endDate}
                            onChange={(e) =>
                              handleDateChange("endDate", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-200">
                      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Inventory Change Log
                        </h3>
                        <span className="text-sm text-gray-600">
                          Total Records: {inventoryWithRemaining.length}
                        </span>
                      </div>
                      <div className="max-h-[30rem] overflow-x-auto rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-100 rounded-lg">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity In/Out
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Plan ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Remaining
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {inventoryWithRemaining.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.date_time}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.quantity_sold}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.plan_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.quantity_remaining}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.signature}
                                </td>
                              </tr>
                            ))}
                            {inventoryWithRemaining.length === 0 && (
                              <tr>
                                <td
                                  colSpan="6"
                                  className="px-6 py-4 text-center text-sm text-gray-500"
                                >
                                  No records found for the selected date range
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="fixed inset-0 flex z-50">
          <div
            className="absolute inset-0 bg-gray-900/75"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative w-full h-full bg-white dark:bg-gray-800 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 flex justify-between items-center shadow-lg">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <span className="material-symbols-outlined mr-2">
                  description
                </span>
                Part Details
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-blue-700 rounded-full text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-4 py-3">
              {/* Part Image Card */}
              <div className="bg-gray-50 rounded-xl p-4 shadow-sm mb-4">
                <img
                  src={bill.M_PART_IMG || "https://via.placeholder.com/300"}
                  alt={bill.M_PART_DESCRIPTION}
                  className="w-full h-48 object-cover rounded-lg shadow-md mb-4"
                />
                {/* Part Information */}
                <div className="space-y-2">
                  <div className="pb-2 border-b border-gray-200">
                    <label className="text-sm font-medium text-gray-500">
                      Part Number
                    </label>
                    <p className="text-gray-800 font-semibold">
                      {bill.M_PART_NUMBER}
                    </p>
                  </div>
                  <div className="pb-2 border-b border-gray-200">
                    <label className="text-sm font-medium text-gray-500">
                      Description
                    </label>
                    <p className="text-gray-800 font-semibold">
                      {bill.M_PART_DESCRIPTION}
                    </p>
                  </div>
                  <div className="pb-2">
                    <label className="text-sm font-medium text-gray-500">
                      Customer
                    </label>
                    <p className="text-gray-800 font-semibold">
                      {bill.M_SUBINV}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Filter Card */}
              <div className="bg-gray-50 rounded-xl p-4 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-800">
                    Date Filter
                  </h3>
                  <button
                    onClick={handleExport}
                    className="flex items-center px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm mr-1">
                      file_download
                    </span>
                    Export
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) =>
                        handleDateChange("startDate", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateFilter.endDate}
                      onChange={(e) =>
                        handleDateChange("endDate", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Table - Card Style for Mobile */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-800">
                    Inventory Change Log
                  </h3>
                  <span className="text-sm text-gray-600">
                    Total: {inventoryWithRemaining.length}
                  </span>
                </div>

                <div className="divide-y divide-gray-200">
                  {inventoryWithRemaining.length > 0 ? (
                    inventoryWithRemaining.map((item, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <label className="text-xs font-medium text-gray-500">
                              ID
                            </label>
                            <p className="font-medium text-gray-900">
                              {item.id}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">
                              Date
                            </label>
                            <p className="font-medium text-gray-900">
                              {item.date_time}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">
                              Quantity
                            </label>
                            <p className="font-medium text-gray-900">
                              {item.quantity_sold}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">
                              Plan ID
                            </label>
                            <p className="font-medium text-gray-900">
                              {item.plan_id}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">
                              Remaining
                            </label>
                            <p className="font-medium text-gray-900">
                              {item.quantity_remaining}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500">
                              User
                            </label>
                            <p className="font-medium text-gray-900">
                              {item.signature}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-gray-500">
                      No records found for the selected date range
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Spacing */}
              <div className="h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetailPopup;
