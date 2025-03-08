import React from "react";
import { useIntersectionObserver } from "../../../../hooks/useIntersectionObserver";
import { PartImage } from "../../../../services/partImageService";

const Card = ({
  bill,
  index,
  startingIndex = 0, 
  selectedRows,
  handleSelectRow,
  handleShowPopup,
}) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.8,
    rootMargin: "-20% 0px",
  });

  // Sequence number with leading zero
  const sequenceNumber = String(startingIndex + index + 1).padStart(2, '0');

  return (
    <div
      ref={ref}
      className={`relative bg-white rounded-3xl overflow-hidden 
        shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform 
        hover:-translate-y-2 mb-6 border border-gray-100
        ${isIntersecting ? "scale-[1.02]" : "scale-100"}`}
    >
      {/* Sequence Number */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full 
          text-sm font-bold tracking-wider shadow-sm">
          {sequenceNumber}
        </div>
      </div>

      {/* Selection Checkbox */}
      <div className="absolute top-4 right-4 z-10">
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            checked={selectedRows.includes(index)}
            onChange={(e) => handleSelectRow(index, e)}
            className="peer relative h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-300 bg-white 
            checked:border-blue-500 checked:bg-blue-500 transition-all duration-200 
            hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent"
          />
          <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            text-white opacity-0 transition-opacity peer-checked:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div 
        className="p-6 cursor-pointer group pt-16" 
        onClick={() => handleShowPopup(bill)}
      >
        <div className="flex items-center space-x-6">
          {/* Part Image */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl overflow-hidden 
              border-2 border-gray-100 shadow-md group-hover:shadow-lg 
              transition-all duration-300">
              <PartImage
                partNumber={bill.M_PART_NUMBER}
                width="w-24"
                height="h-24"
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Part Details */}
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {bill.M_PART_NUMBER}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-800 transition-colors">
              {bill.M_PART_DESCRIPTION}
            </p>
            
            {/* SubInventory and Stock Qty */}
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1  
                bg-orange-50 text-orange-600 rounded-full text-xs font-medium 
                group-hover:bg-orange-100 transition-colors">
                <span className="material-symbols-outlined text-sm mr-1">
                warehouse
                </span>
                {bill.M_SUBINV}
              </span>
              
              {/* Stock Quantity */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                ${Number(bill.stk_qty) > 0 
                  ? "bg-green-50 text-green-600 group-hover:bg-green-100" 
                  : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"} 
                transition-colors`}>
                <span className="material-symbols-outlined text-sm mr-1">
                  {Number(bill.stk_qty) > 0 ? "inventory_2" : "inventory_2"}
                </span>
                {(() => {
                  // กำหนดค่าเริ่มต้นเป็น "0"
                  let displayValue = "0";
                  
                  // ถ้ามีค่า stk_qty และสามารถแปลงเป็นตัวเลขได้
                  if (bill.stk_qty) {
                    try {
                      const numericValue = String(bill.stk_qty).replace(/[^\d.-]/g, '');
                      if (numericValue && !isNaN(parseFloat(numericValue))) {
                        displayValue = numericValue;
                      }
                    } catch (e) {
                      console.error("Error formatting stk_qty:", e);
                    }
                  }
                  
                  return displayValue;
                })()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Button */}
      <div className="px-6 pb-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShowPopup(bill);
          }}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 
          text-white text-sm font-semibold rounded-xl 
          hover:from-blue-700 hover:to-indigo-800 
          focus:outline-none focus:ring-2 focus:ring-blue-400 
          transition-all duration-300 ease-in-out 
          transform hover:scale-[1.02] active:scale-95 
          shadow-md hover:shadow-lg"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default Card;