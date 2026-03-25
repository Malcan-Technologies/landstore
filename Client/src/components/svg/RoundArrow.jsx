import React from "react";

const RoundArrow = ({ size = 18, color = "#298064", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M13.773 6.03745L13.2426 5.50712C10.8995 3.16397 7.1005 3.16397 4.75736 5.50712C2.41421 7.85026 2.41421 11.6493 4.75736 13.9924C7.1005 16.3355 10.8995 16.3355 13.2426 13.9924C14.6053 12.6298 15.1755 10.7748 14.9533 9.00015M13.773 6.03745H10.591M13.773 6.03745V2.85547"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default RoundArrow;
