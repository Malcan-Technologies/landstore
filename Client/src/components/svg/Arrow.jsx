import React from "react";

const Arrow = ({ size = 16, color = "white", className, ...props }) => (
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
      d="M8.98011 3.64645C9.17537 3.45118 9.49195 3.45118 9.68721 3.64645L13.6872 7.64645C13.8825 7.84171 13.8825 8.15829 13.6872 8.35355L9.68721 12.3536C9.49195 12.5488 9.17537 12.5488 8.98011 12.3536C8.78484 12.1583 8.78484 11.8417 8.98011 11.6464L12.1266 8.5H2.66699C2.39085 8.5 2.16699 8.27614 2.16699 8C2.16699 7.72386 2.39085 7.5 2.66699 7.5H12.1266L8.98011 4.35355C8.78484 4.15829 8.78484 3.84171 8.98011 3.64645Z"
      fill={color}
    />
  </svg>
);

export default Arrow;
