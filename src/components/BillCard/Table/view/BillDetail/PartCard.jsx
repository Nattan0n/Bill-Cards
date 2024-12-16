// components/BillCard/view/BillDetail/PartCard.jsx
import React from "react";

export const PartCard = ({ partNumber, description, image }) => (
  <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-200">
    <div className="aspect-square overflow-hidden">
      <img
        src={image || "https://via.placeholder.com/300"}
        alt={description}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    </div>
    <div className="absolute left-0 right-0 bottom-0 p-4 bg-gradient-to-t from-gray-900/95 via-gray-800/80 text-white z-20 ">
      <h3 className="text-lg font-bold truncate mb-1">{partNumber}</h3>
      <p className="text-sm text-white/90 line-clamp-2">{description}</p>
    </div>
  </div>
);
