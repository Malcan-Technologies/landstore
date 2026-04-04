import React from "react";

const MapStatReview = ({ size = 24, className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 9V13H16" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 3.5" />
  </svg>
);

export default MapStatReview;
