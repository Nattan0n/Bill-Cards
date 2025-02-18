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

  return (
    <div
      ref={ref}
      className={`group bg-white rounded-2xl overflow-hidden 
          transition-all duration-500 transform mb-4 shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,78,255,0.15)]
          ${isIntersecting ? "scale-105" : "scale-100"}`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-800 text-white">
        <div className="flex items-center space-x-3">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={selectedRows.includes(index)}
              onChange={(e) => handleSelectRow(index, e)}
              className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-white/50 bg-transparent transition-all checked:border-white checked:bg-white"
            />
            <span className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-blue-600 opacity-0 transition-opacity peer-checked:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>
          <span className="text-lg font-medium">{startingIndex + index + 1}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-sm">
            calendar_today
          </span>
          <span className="text-sm">{bill.M_DATE}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 cursor-pointer" onClick={() => handleShowPopup(bill)}>
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              <PartImage
                partNumber={bill.M_PART_NUMBER}
                width="w-20"
                height="h-20"
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {bill.M_PART_NUMBER}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {bill.M_PART_DESCRIPTION}
            </p>
            <div className="flex flex-col space-y-2">
              {/* Transaction Type */}
              {/* <span className="inline-flex items-center px-2.5 py-1 w-fit rounded-lg bg-indigo-50 text-xs font-medium text-indigo-700">
                {bill.TRANSACTION_TYPE_NAME}
              </span> */}

              {/* SubInventory */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-gray-600 text-sm">
                    inventory_2
                  </span>
                  <span className="text-sm text-gray-600 font-medium">
                    {bill.M_SUBINV}
                  </span>
                </div>

                {/* Quantity */}
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg ${
                    bill.totalQty > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  } text-xs font-medium`}
                >
                  <span className="material-symbols-outlined text-sm mr-1">
                    {bill.totalQty > 0 ? "add_circle" : "remove_circle"}
                  </span>
                  {bill.totalQty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
        {/* Transaction Type */}
        <span className="inline-flex items-center px-2.5 py-1 w-fit rounded-lg bg-indigo-50 text-xs font-medium text-indigo-700">
          {bill.TRANSACTION_TYPE_NAME}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShowPopup(bill);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  );
};

export default Card;
