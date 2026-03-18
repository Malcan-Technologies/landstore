import React from "react";

const Details = ({ size = 18, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <g clipPath="url(#details-clip)">
      <path d="M16.5 10.4984C16.4783 13.0589 16.3361 14.4705 15.4053 15.4014C14.3066 16.5 12.5384 16.5 9.00196 16.5C5.4655 16.5 3.69727 16.5 2.59864 15.4014C1.5 14.3027 1.5 12.5345 1.5 8.99804C1.5 5.46159 1.5 3.69336 2.59864 2.59472C3.5295 1.66386 4.94105 1.52171 7.50157 1.5" stroke="#298064" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16.5 5.25H10.5C9.20319 5.25 8.39638 5.85542 8.05853 6.178C7.93433 6.2966 7.87223 6.35589 7.86406 6.36406C7.85589 6.37223 7.7966 6.43433 7.678 6.55853C7.35542 6.89638 6.75 7.70319 6.75 9V11.25M16.5 5.25L12.75 1.5M16.5 5.25L12.75 9" stroke="#298064" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <defs>
      <clipPath id="details-clip">
        <rect width="18" height="18" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default Details;
