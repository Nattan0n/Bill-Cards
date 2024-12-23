// components/BillCard/view/BillDetail/PartCard.jsx
import React from "react";
import { PartImage } from "../../../../../services/partImageService";

export const PartCard = ({ partNumber, description, image }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
    <div className="aspect-square overflow-hidden">
      {/* ใช้ PartImage component แทนการใช้ img tag ตรงๆ */}
      <PartImage
        partNumber={partNumber}
        width="w-full"
        height="h-full"
        className="object-cover transition-transform duration-500 group-hover:scale-110"
      />
    </div>
    <div className="absolute left-0 right-0 bottom-0 p-4 bg-gradient-to-t from-gray-900/95 via-gray-800/80 text-white z-20">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-sm">
          tag
        </span>
        <h3 className="text-lg font-bold truncate">{partNumber}</h3>
      </div>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">
          info
        </span>
        <p className="text-sm text-white/90 line-clamp-2">{description}</p>
      </div>
    </div>
  </div>
);