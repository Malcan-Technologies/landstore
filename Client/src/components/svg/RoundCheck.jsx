import React from "react";

const RoundCheck = ({
  size = 18,
  className,
  color = "#298064",
  tickColor,
  filled = false,
  strokeWidth = 1.5,
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 18 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {filled ? (
      <>
        <circle cx="9" cy="11" r="7.5" fill={color} />
        <path
          d="M6.375 11.375L7.875 12.875L11.625 9.125"
          stroke={tickColor || "#FFFFFF"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ) : (
      <>
        <circle cx="9" cy="11" r="7.5" stroke={color} strokeWidth={strokeWidth} />
        <path
          d="M6.375 11.375L7.875 12.875L11.625 9.125"
          stroke={tickColor || color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </svg>
);

export default RoundCheck;
