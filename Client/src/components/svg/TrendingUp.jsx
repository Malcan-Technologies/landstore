import React from "react";

const TrendingUp = ({ size = 12, color = "#079455", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M6 9.5V2.5M6 2.5L2.5 6M6 2.5L9.5 6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TrendingUp;
