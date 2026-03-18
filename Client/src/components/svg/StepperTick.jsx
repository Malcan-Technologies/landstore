import React from "react";

const StepperTick = ({ width = 16, height = 14, color = "white", className, ...props }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 16 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.3285 0.365916L4.78188 9.57925L2.24854 6.87258C1.78187 6.43258 1.04854 6.40592 0.515208 6.77925C-0.00479217 7.16592 -0.151459 7.84591 0.168541 8.39258L3.16854 13.2726C3.46187 13.7259 3.96854 14.0059 4.54187 14.0059C5.08854 14.0059 5.60854 13.7259 5.90188 13.2726C6.38188 12.6459 15.5419 1.72592 15.5419 1.72592C16.7419 0.499249 15.2885 -0.580751 14.3285 0.352583V0.365916Z"
      fill={color}
    />
  </svg>
);

export default StepperTick;
