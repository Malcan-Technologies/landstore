import React from "react";

const ArrowDown = ({ size = 16, color = "#020617", className, ...props }) => (
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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.52925 5.52876C3.7896 5.26841 4.21171 5.26841 4.47206 5.52876L8.00065 9.05735L11.5292 5.52876C11.7896 5.26841 12.2117 5.26841 12.4721 5.52876C12.7324 5.78911 12.7324 6.21122 12.4721 6.47157L8.47205 10.4716C8.21171 10.7319 7.7896 10.7319 7.52925 10.4716L3.52925 6.47157C3.2689 6.21122 3.2689 5.78911 3.52925 5.52876Z"
      fill={color}
    />
  </svg>
);

export default ArrowDown;
