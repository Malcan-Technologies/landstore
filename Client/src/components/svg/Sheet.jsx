import React from "react";

const Sheet = ({ size = 14, color = "#15803D", className, ...props }) => (
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
      d="M1.75 5.83317C1.75 3.63328 1.75 2.53334 2.43342 1.84992C3.11684 1.1665 4.21678 1.1665 6.41667 1.1665H7.58333C9.78322 1.1665 10.8832 1.1665 11.5666 1.84992C12.25 2.53334 12.25 3.63328 12.25 5.83317V8.1665C12.25 10.3664 12.25 11.4663 11.5666 12.1498C10.8832 12.8332 9.78322 12.8332 7.58333 12.8332H6.41667C4.21678 12.8332 3.11684 12.8332 2.43342 12.1498C1.75 11.4663 1.75 10.3664 1.75 8.1665V5.83317Z"
      stroke={color}
      strokeWidth="1.2"
    />
    <path d="M4.66602 7H9.33268" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M4.66602 4.6665H9.33268" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M4.66602 9.3335H7.58268" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export default Sheet;
