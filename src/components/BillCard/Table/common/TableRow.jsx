import React from 'react';
import { Checkbox } from '../Checkbox';

export const TableRow = ({ 
  bill, 
  index,
  startingIndex,
  isSelected,
  onSelect,
  onShowDetails 
}) => {
  return (
    <tr className="group hover:bg-blue-50/50 transition-colors duration-200">
      <td className="p-4 w-[50px]">
        <div className="flex items-center justify-center">
          <Checkbox checked={isSelected} onChange={onSelect} />
        </div>
      </td>
      <td className="p-4 text-sm font-medium text-gray-900">
        #{startingIndex + index + 1}
      </td>
      <td className="p-4">
        <PartImage image={bill.M_PART_IMG} name={bill.M_PART_DESCRIPTION} />
      </td>
      <td className="p-4 text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
        {bill.M_PART_NUMBER}
      </td>
      <td className="p-4 text-sm text-gray-600 max-w-xs">
        <p className="line-clamp-2">{bill.M_PART_DESCRIPTION}</p>
      </td>
      {/* ... ส่วนอื่นๆ ของแถว */}
      <td className="p-4">
        <button
          onClick={() => onShowDetails(bill)}
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-all duration-300 shadow-sm hover:shadow group-hover:scale-105"
        >
          <span className="material-symbols-outlined text-sm mr-1">visibility</span>
          Details
        </button>
      </td>
    </tr>
  );
};