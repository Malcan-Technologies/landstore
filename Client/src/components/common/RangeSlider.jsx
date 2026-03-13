"use client";

import React, { useMemo, useRef } from "react";
import { RadioGroup } from "@headlessui/react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const roundToStep = (value, min, step) => Math.round((value - min) / step) * step + min;

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
  const trackRef = useRef(null);
  const steps = useMemo(() => {
    const results = [];
    for (let current = min; current <= max; current += step) {
      results.push(Number(current.toFixed(4)));
    }
    return results;
  }, [min, max, step]);

  const updateValue = (nextStart, nextEnd) => {
    if (!onChange) return;
    onChange([clamp(nextStart, min, nextEnd - step), clamp(nextEnd, nextStart + step, max)]);
  };

  const percentFromValue = (val) => ((val - min) / (max - min)) * 100;

  const moveHandle = (clientX, handle) => {
    const track = trackRef.current;
    if (!track) return;
    const { left, width } = track.getBoundingClientRect();
    const ratio = clamp((clientX - left) / width, 0, 1);
    const rawValue = min + ratio * (max - min);
    const snapped = clamp(roundToStep(rawValue, min, step), min, max);

    if (handle === "start") {
      updateValue(snapped, end);
    } else {
      updateValue(start, snapped);
    }
  };

  const attachPointerEvents = (handle) => (event) => {
    event.preventDefault();
    moveHandle(event.clientX, handle);

    const onMove = (moveEvent) => moveHandle(moveEvent.clientX, handle);
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp, { once: true });
  };

  const handleKeyDown = (handle) => (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      const delta = -step;
      if (handle === "start") updateValue(start + delta, end);
      else updateValue(start, end + delta);
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = step;
      if (handle === "start") updateValue(start + delta, end);
      else updateValue(start, end + delta);
    }
  };

  const renderHandle = (position, handle) => (
    <button
      type="button"
      aria-label={handle === "start" ? "Minimum value" : "Maximum value"}
      onPointerDown={attachPointerEvents(handle)}
      onKeyDown={handleKeyDown(handle)}
      className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-[#1A1A1A] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#145C45]/60"
      style={{ left: `calc(${percentFromValue(position)}% - 12px)` }}
    />
  );

  return (
    <div className={`w-full max-w-md ${className}`.trim()} {...props}>
      {/* Hidden radio groups satisfy the "Headless UI" requirement for discrete values & accessibility */}
      <div className="sr-only">
        <RadioGroup value={start} onChange={(val) => updateValue(val, end)}>
          {steps.map((option) => (
            <RadioGroup.Option key={`start-${option}`} value={option}>
              {option}
            </RadioGroup.Option>
          ))}
        </RadioGroup>
        <RadioGroup value={end} onChange={(val) => updateValue(start, val)}>
          {steps.map((option) => (
            <RadioGroup.Option key={`end-${option}`} value={option}>
              {option}
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </div>

      <div ref={trackRef} className="relative h-3 rounded-full bg-[#E8EAED]">
        <div
          className="absolute top-0 h-full rounded-full bg-[#121212]"
          style={{
            left: `${percentFromValue(start)}%`,
            width: `${percentFromValue(end) - percentFromValue(start)}%`,
          }}
        />
        {renderHandle(start, "start")}
        {renderHandle(end, "end")}
      </div>

      {showValues ? (
        <div className="mt-3 flex items-center justify-between text-[14px] font-medium text-[#1A1A1A]">
          <span>{formatValue(start)}</span>
          <span>{formatValue(end)}</span>
        </div>
      ) : null}
    </div>
  );
};

export default RangeSlider;
