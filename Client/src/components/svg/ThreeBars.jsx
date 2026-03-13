import React from "react";

const ThreeBars = ({ size = 18, color = "#0F3D2E", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.8164 4.99816C14.8164 5.29393 14.5766 5.53369 14.2809 5.53369L2.8562 5.53369C2.56044 5.53369 2.32067 5.29393 2.32067 4.99816C2.32067 4.70239 2.56044 4.46263 2.8562 4.46263L14.2809 4.46263C14.5766 4.46263 14.8164 4.70239 14.8164 4.99816Z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.8164 8.56847C14.8164 8.86424 14.5766 9.104 14.2809 9.104L2.8562 9.104C2.56044 9.104 2.32067 8.86424 2.32067 8.56847C2.32067 8.27271 2.56044 8.03294 2.8562 8.03294L14.2809 8.03294C14.5766 8.03294 14.8164 8.27271 14.8164 8.56847Z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.8164 12.1388C14.8164 12.4346 14.5766 12.6743 14.2809 12.6743L2.8562 12.6743C2.56044 12.6743 2.32067 12.4346 2.32067 12.1388C2.32067 11.843 2.56044 11.6033 2.8562 11.6033L14.2809 11.6033C14.5766 11.6033 14.8164 11.843 14.8164 12.1388Z"
      fill={color}
    />
  </svg>
);

export default ThreeBars;
