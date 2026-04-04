import React from "react";

const IdentityVerified = ({ size = 15, color = "#298064", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M1.875 6.51041C1.875 4.51192 1.875 3.51267 2.11095 3.17651C2.34689 2.84034 3.28645 2.51872 5.16557 1.8755L5.52358 1.75295C6.50311 1.41765 6.99288 1.25 7.5 1.25C8.00712 1.25 8.49689 1.41765 9.47642 1.75295L9.83443 1.8755C11.7135 2.51872 12.6531 2.84034 12.8891 3.17651C13.125 3.51267 13.125 4.51192 13.125 6.51041C13.125 6.81228 13.125 7.13964 13.125 7.4946C13.125 11.0184 10.4756 12.7284 8.8134 13.4545C8.36249 13.6515 8.13704 13.75 7.5 13.75C6.86296 13.75 6.63751 13.6515 6.1866 13.4545C4.52435 12.7284 1.875 11.0184 1.875 7.4946C1.875 7.13964 1.875 6.81228 1.875 6.51041Z"
      stroke={color}
      strokeWidth="1.5"
    />
    <path
      d="M5.9375 7.75L6.83036 8.75L9.0625 6.25"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default IdentityVerified;
