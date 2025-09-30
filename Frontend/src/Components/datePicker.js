// src/components/Shared/DatePicker.jsx
import React, { useState, useEffect, useRef } from "react";
import { DateRange } from "react-date-range";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DatePicker = ({ appliedStartDate, appliedEndDate, onApply }) => {
  const [visible, setVisible] = useState(false);
  const [selection, setSelection] = useState({
    startDate: appliedStartDate,
    endDate: appliedEndDate,
    key: "selection",
  });
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setVisible(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelection({ startDate: appliedStartDate, endDate: appliedEndDate, key: "selection" });
  }, [appliedStartDate, appliedEndDate]);

  const handleApply = () => {
    onApply(selection.startDate, selection.endDate);
    setVisible(false);
  };

  const handleCancel = () => {
    setSelection({ startDate: appliedStartDate, endDate: appliedEndDate, key: "selection" });
    setVisible(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setVisible(true)}
        className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-100"
      >
        <Calendar size={20} />
        {`${format(appliedStartDate, "MMM d, yyyy")} - ${format(appliedEndDate, "MMM d, yyyy")}`}
      </button>

      {visible && (
        <div ref={ref} className="absolute z-50 mt-2 p-4 bg-white shadow-lg border rounded">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setSelection(item.selection)}
            moveRangeOnFirstSelection={false}
            ranges={[selection]}
            months={1}
            direction="horizontal"
            showSelectionPreview={true}
            maxDate={new Date()}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={handleCancel} className="px-3 py-1 border rounded hover:bg-gray-100">
              Cancel
            </button>
            <button onClick={handleApply} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
