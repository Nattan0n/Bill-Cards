import React, { useState } from 'react';
import { HoverTooltip } from './HoverTooltip';

export const IconButton = ({ 
  icon, 
  label, 
  onClick, 
  className, 
  tooltipText,
  tooltipTitle, // เพิ่ม prop สำหรับ tooltip title
  hideLabel = false, // เพิ่ม prop สำหรับควบคุมการแสดง label
  iconColor = 'text-gray-400'
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e) => {
    setIsClicked(true);
    onClick?.(e);
    
    setTimeout(() => {
      setIsClicked(false);
    }, 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        className={`${className} active:scale-95 transform transition-all duration-200`}
      >
        <span className={`material-symbols-outlined ${!hideLabel && 'mr-2'} group-hover:scale-110 transition-transform duration-200 ${iconColor}`}>
          {icon}
        </span>
        {label && !hideLabel && (
          <span className="text-sm font-medium tracking-wide">
            {label}
          </span>
        )}
      </button>
      {tooltipText && !isClicked && (
        <div className="hidden md:block">
          <HoverTooltip 
            title={tooltipTitle || label} // ใช้ tooltipTitle ถ้ามี ถ้าไม่มีจะใช้ label
            text={tooltipText}
          />
        </div>
      )}
    </div>
  );
};