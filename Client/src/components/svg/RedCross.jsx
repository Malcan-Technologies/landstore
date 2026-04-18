import React from "react";

const RedCross = ({ size = 18, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <g clipPath="url(#clip0_422_28860)">
      <circle cx="9" cy="9" r="7.5" stroke="#EF4444" strokeWidth="1.5" />
      <path
        d="M10.875 7.12502L7.125 10.875M7.12498 7.125L10.875 10.875"
        stroke="#EF4444"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_422_28860">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default RedCross;
