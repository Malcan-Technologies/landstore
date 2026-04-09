import React from "react";

const ChartDropdownArrow = ({ size = 14, color = "currentColor", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M3.5 5.25L7 8.75L10.5 5.25"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ChartDropdownArrow;
