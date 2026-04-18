import React from "react";

const Person = ({ size = 20, color = "var(--color-gray2)", className, filled = false, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {filled ? (
      <>
        <circle cx="10.0003" cy="5.00033" r="3.33333" fill={color} />
        <ellipse cx="10.0003" cy="14.1663" rx="5.83333" ry="3.33333" fill={color} />
      </>
    ) : (
      <>
        <circle cx="10.0003" cy="5.00033" r="3.33333" stroke={color} strokeWidth="1.5" />
        <ellipse cx="10.0003" cy="14.1663" rx="5.83333" ry="3.33333" stroke={color} strokeWidth="1.5" />
      </>
    )}
  </svg>
);

export default Person;
