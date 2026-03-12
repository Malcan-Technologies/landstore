import React from "react";

const Persons = ({ size = 20, color = "#1A1A1A", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="7.50033" cy="5.00033" r="3.33333" stroke={color} strokeWidth="1.5" />
    <path d="M12.5 7.5C13.8807 7.5 15 6.38071 15 5C15 3.61929 13.8807 2.5 12.5 2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <ellipse cx="7.50033" cy="14.1663" rx="5.83333" ry="3.33333" stroke={color} strokeWidth="1.5" />
    <path d="M15 11.667C16.4619 11.9876 17.5 12.7994 17.5 13.7503C17.5 14.6081 16.6552 15.3528 15.4167 15.7257" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default Persons;
