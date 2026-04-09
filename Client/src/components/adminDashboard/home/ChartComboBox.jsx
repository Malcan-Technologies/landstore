import React from "react";

const ChartComboBox = ({
  options = [],
  selectedValue,
  onChange,
  selectedOption,
  onSelectOption,
}) => {
  const activeValue = selectedValue ?? selectedOption;
  const handleChange = onChange ?? onSelectOption;

  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-border-card bg-white">
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          onClick={() => handleChange?.(option)}
          className={`px-3 py-1.5 text-[11px] font-medium transition sm:text-[12px] ${
            activeValue === option
              ? "bg-gray-100"
              : "bg-white text-gray2 hover:bg-background-primary"
          } ${index !== options.length - 1 ? "border-r border-border-card" : ""}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default ChartComboBox;
