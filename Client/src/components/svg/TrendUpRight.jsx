import React from "react";

const TrendUpRight = ({ size = 12, color = "#17B26A", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M3.5 8.5L8.5 3.5M8.5 3.5H3.5M8.5 3.5V8.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TrendUpRight;
