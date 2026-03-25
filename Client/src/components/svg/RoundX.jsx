import React from "react";

const RoundX = ({ size = 18, color = "#EF4444", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="1.5" />
    <path
      d="M10.875 7.12502L7.125 10.875M7.12498 7.125L10.875 10.875"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default RoundX;
