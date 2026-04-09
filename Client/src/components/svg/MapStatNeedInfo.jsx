import React from "react";

const MapStatNeedInfo = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="1.5" />
    <path d="M12 7V13" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill="#EF4444" />
  </svg>
);

export default MapStatNeedInfo;
