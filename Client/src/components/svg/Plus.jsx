import React from "react";

const Plus = ({ size = 16, color = "currentColor", className, ...props }) => (
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
      d="M8.6665 3.33317C8.6665 2.96498 8.36803 2.6665 7.99984 2.6665C7.63165 2.6665 7.33317 2.96498 7.33317 3.33317V7.33317H3.33317C2.96498 7.33317 2.6665 7.63165 2.6665 7.99984C2.6665 8.36803 2.96498 8.6665 3.33317 8.6665H7.33317V12.6665C7.33317 13.0347 7.63165 13.3332 7.99984 13.3332C8.36803 13.3332 8.6665 13.0347 8.6665 12.6665V8.6665H12.6665C13.0347 8.6665 13.3332 8.36803 13.3332 7.99984C13.3332 7.63165 13.0347 7.33317 12.6665 7.33317H8.6665V3.33317Z"
      fill={color}
    />
  </svg>
);

export default Plus;
