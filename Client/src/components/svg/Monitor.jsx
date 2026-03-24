import React from "react";

const Monitor = ({ size = 16, color = "#3F3F3F", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M2 6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2H10C11.8856 2 12.8284 2 13.4142 2.58579C14 3.17157 14 4.11438 14 6V9.33333C14 10.5904 14 11.219 13.6095 11.6095C13.219 12 12.5904 12 11.3333 12H4.66667C3.40959 12 2.78105 12 2.39052 11.6095C2 11.219 2 10.5904 2 9.33333V6Z"
      stroke={color}
      strokeWidth="1.2"
    />
    <path d="M14.6673 14H1.33398" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M10 10H6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export default Monitor;
