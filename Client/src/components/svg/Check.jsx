"use client";

import React from "react";

const Check = ({
  size = 36,
  stroke = "#FFFFFF",
  strokeWidth = 2.5,
  className = "",
  circleFill,
  circleStroke,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`block ${className}`.trim()}
    preserveAspectRatio="xMidYMid meet"
  >
    {circleFill || circleStroke ? (
      <circle cx="12" cy="12" r="11" fill={circleFill ?? "none"} stroke={circleStroke ?? "none"} />
    ) : null}
    <path
      d="M5 12.5L10 17L19 7"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength="1"
      className="animate-check"
    />
  </svg>
);

export default Check;
