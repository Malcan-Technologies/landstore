import React from "react";

const PersonEntity = ({ size = 24, color = "white", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="6" r="4" stroke={color} strokeWidth="1.5" />
    <ellipse cx="12" cy="17" rx="7" ry="4" stroke={color} strokeWidth="1.5" />
  </svg>
);

export default PersonEntity;
