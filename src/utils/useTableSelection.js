import { useState, useCallback } from "react";

export const useTableSelection = (items, onSelectionChange) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectAll = useCallback(
    (e) => {
      const isChecked = e.target.checked;
      const newSelectedRows = isChecked ? items.map((_, index) => index) : [];
      setSelectedRows(newSelectedRows);
      onSelectionChange?.(isChecked ? items : []);
    },
    [items, onSelectionChange]
  );

  const handleSelectRow = useCallback(
    (index, e) => {
      e?.stopPropagation();
      setSelectedRows((prev) => {
        const newSelectedRows = prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index];

        const selectedItems = newSelectedRows.map((idx) => items[idx]);
        onSelectionChange?.(selectedItems);

        return newSelectedRows;
      });
    },
    [items, onSelectionChange]
  );

  return {
    selectedRows,
    handleSelectAll,
    handleSelectRow,
    setSelectedRows,
  };
};
