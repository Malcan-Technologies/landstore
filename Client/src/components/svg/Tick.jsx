import React from "react";

const Tick = ({ width = 12, height = 10, color = "#298064", className, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 12 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M0.75 5.55L3.54365 8.75L10.5278 0.75"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Tick;
