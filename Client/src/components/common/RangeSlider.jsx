"use client";

import React from "react";
import RangeSliderInput from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

const RangeSlider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
  showValues = true,
  formatValue = (val) => val,
  ...props
}) => {
  const [start, end] = value || [min, max];

  return (
    <div className={`w-full max-w-md ${className}`.trim()} {...props}>
      <RangeSliderInput
        min={min}
        max={max}
        step={step}
        value={[start, end]}
        onInput={(nextValue) => onChange?.(nextValue)}
        className="land-range-slider"
      />

      {showValues ? (
        <div className="mt-3 flex items-center justify-between text-[14px] font-medium text-gray2">
          <span>{formatValue(start)}</span>
          <span>{formatValue(end)}</span>
        </div>
      ) : null}

      <style jsx global>{`
        .land-range-slider {
          height: 6px;
        }

        .land-range-slider .range-slider,
        .land-range-slider .range-slider__range,
        .land-range-slider .range-slider__track {
          height: 6px;
          border-radius: 9999px;
          box-shadow: none;
        }

        .land-range-slider .range-slider__track {
          background: #e5e7eb;
          
        }

        .land-range-slider .range-slider__range {
          background: #202020;
        }

        .land-range-slider .range-slider__thumb {
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          border: 2px solid #202020;
          background: #ffffff;
          box-shadow: none;
        }

        .land-range-slider .range-slider__thumb[data-lower] {
          background: #ffffff;
        }
      `}</style>
    </div>
  );
};

export default RangeSlider;
