import React from "react";

const List2 = ({ size = 20, color = "var(--color-green-secondary)", className, ...props }) => (
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
      d="M1.6665 10.0003C1.6665 6.07195 1.6665 4.10777 2.88689 2.88738C4.10728 1.66699 6.07147 1.66699 9.99984 1.66699C13.9282 1.66699 15.8924 1.66699 17.1128 2.88738C18.3332 4.10777 18.3332 6.07195 18.3332 10.0003C18.3332 13.9287 18.3332 15.8929 17.1128 17.1133C15.8924 18.3337 13.9282 18.3337 9.99984 18.3337C6.07147 18.3337 4.10728 18.3337 2.88689 17.1133C1.6665 15.8929 1.6665 13.9287 1.6665 10.0003Z"
      stroke={color}
      strokeWidth="1.5"
    />
    <path
      d="M5 13.167L5.95238 14.167L8.33333 11.667"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 7.33301L5.95238 8.33301L8.33333 5.83301"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10.8335 7.5L15.0002 7.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10.8335 13.333L15.0002 13.333" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default List2;

