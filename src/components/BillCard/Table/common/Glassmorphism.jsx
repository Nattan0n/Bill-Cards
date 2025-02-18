import React from "react";
import { useIntersectionObserver } from "../../../../hooks/useIntersectionObserver";
import { PartImage } from "../../../../services/partImageService";

const GlassmorphismCard = ({
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
      className={`relative overflow-hidden rounded-3xl 
        transition-all duration-300 
        ${isIntersecting ? "scale-[1.02]" : "scale-100"}
        hover:-translate-y-2`}
    >
      {/* Glassmorphic Background */}
      <div 
        className="absolute inset-0 bg-white/10 backdrop-blur-lg 
        border border-white/20 rounded-3xl 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]"
      />

      {/* Content Container */}
      <div className="relative z-10 bg-transparent">
        {/* Header with Numbering and Checkbox */}
        <div className="flex justify-between items-center p-4 
          border-b border-white/20">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedRows.includes(index)}
              onChange={(e) => handleSelectRow(index, e)}
              className="form-checkbox h-5 w-5 text-blue-500 
                bg-white/20 border-white/30 rounded 
                focus:ring-blue-400 focus:ring-opacity-50"
            />
            <span className="text-sm text-gray-700">#{startingIndex + index + 1}</span>
          </div>
        </div>

        {/* Content */}
        <div 
          className="p-6 cursor-pointer group"
          onClick={() => handleShowPopup(bill)}
        >
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-xl overflow-hidden 
                border-2 border-white/30 shadow-lg 
                group-hover:shadow-xl transition-all duration-300">
                <PartImage
                  partNumber={bill.M_PART_NUMBER}
                  width="w-24"
                  height="h-24"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold text-gray-800 
                group-hover:text-blue-600 transition-colors">
                {bill.M_PART_NUMBER}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 
                group-hover:text-gray-800 transition-colors">
                {bill.M_PART_DESCRIPTION}
              </p>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 
                  bg-white/20 text-gray-800 rounded-full text-xs font-medium 
                  group-hover:bg-white/40 transition-colors">
                  <span className="material-symbols-outlined text-sm mr-1">
                    inventory_2
                  </span>
                  {bill.M_SUBINV}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 pt-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShowPopup(bill);
            }}
            className="w-full py-3 bg-gradient-to-r from-blue-500/80 to-purple-600/80 
            text-white text-sm font-semibold rounded-xl 
            hover:from-blue-600/90 hover:to-purple-700/90
            focus:outline-none focus:ring-2 focus:ring-blue-400 
            transition-all duration-300 ease-in-out 
            transform hover:scale-[1.02] active:scale-95 
            backdrop-blur-sm shadow-lg hover:shadow-xl"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismCard;