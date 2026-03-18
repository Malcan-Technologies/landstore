import React from "react";

const Pointer = ({ size = 17, color = "var(--color-green-secondary)", className, ...props }) => (
  <svg
    width={(size * 14) / 17}
    height={size}
    viewBox="0 0 14 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.66667 0C2.98477 0 0 3.33549 0 7.08333C0 10.8018 2.12777 14.8437 5.44756 16.3954C6.22145 16.7571 7.11188 16.7571 7.88578 16.3954C11.2056 14.8437 13.3333 10.8018 13.3333 7.08333C13.3333 3.33549 10.3486 0 6.66667 0ZM6.66667 8.33333C7.58714 8.33333 8.33333 7.58714 8.33333 6.66667C8.33333 5.74619 7.58714 5 6.66667 5C5.74619 5 5 5.74619 5 6.66667C5 7.58714 5.74619 8.33333 6.66667 8.33333Z"
      fill={color}
    />
  </svg>
);

export default Pointer;
