import React from "react";

const Building = ({ size = 20, color = "#1A1A1A", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M18.3337 18.333L1.66699 18.333" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14.1663 18.3337V5.00033C14.1663 3.42898 14.1663 2.6433 13.6782 2.15515C13.19 1.66699 12.4044 1.66699 10.833 1.66699H9.16634C7.59499 1.66699 6.80932 1.66699 6.32116 2.15515C5.83301 2.6433 5.83301 3.42898 5.83301 5.00033V18.3337" stroke={color} strokeWidth="1.5" />
    <path d="M17.4997 18.3337V9.58366C17.4997 8.41327 17.4997 7.82808 17.2188 7.40771C17.0972 7.22572 16.9409 7.06947 16.759 6.94788C16.3386 6.66699 15.7534 6.66699 14.583 6.66699" stroke={color} strokeWidth="1.5" />
    <path d="M2.5 18.3337V9.58366C2.5 8.41327 2.5 7.82808 2.78088 7.40771C2.90248 7.22572 3.05873 7.06947 3.24072 6.94788C3.66109 6.66699 4.24628 6.66699 5.41667 6.66699" stroke={color} strokeWidth="1.5" />
    <path d="M10 18.333V15.833" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.33301 4.16699H11.6663" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.33301 6.66699H11.6663" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.33301 9.16699H11.6663" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.33301 11.667H11.6663" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default Building;
