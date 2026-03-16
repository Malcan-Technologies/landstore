import React from "react";

const Exclamation = ({ size = 24, color = "#EF4848", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="11.9724" cy="12.888" r="9.86842" stroke={color} strokeWidth="1.5" />
    <path d="M11.9727 7.95312V13.8742" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="11.9722" cy="16.8345" r="0.986842" fill={color} />
  </svg>
);

export default Exclamation;
