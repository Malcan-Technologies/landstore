import React from "react";

const EyeOpen = ({ size = 20, color = "#6B6B6B", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M1.66699 10C2.91699 6.875 6.02532 4.16667 10.0003 4.16667C13.9753 4.16667 17.0837 6.875 18.3337 10C17.0837 13.125 13.9753 15.8333 10.0003 15.8333C6.02532 15.8333 2.91699 13.125 1.66699 10Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="10.0003" cy="10" r="2.5" stroke={color} strokeWidth="1.5" />
  </svg>
);

export default EyeOpen;
