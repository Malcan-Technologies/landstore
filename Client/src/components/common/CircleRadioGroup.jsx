"use client";

import React from "react";
import { RadioGroup } from "@headlessui/react";

const CircleRadioGroup = ({
  value,
  onChange,
  options,
  className = "",
  optionClassName = "",
  name,
  ...props
}) => (
  <RadioGroup
    value={value}
    onChange={onChange}
    name={name}
    className={`flex items-center gap-6 ${className}`.trim()}
    {...props}
  >
    {options?.map((option) => (
      <RadioGroup.Option key={option.value} value={option.value} className="focus:outline-none">
        {({ checked }) => (
          <span
            className={`flex cursor-pointer items-center gap-2 text-[14px] font-medium transition ${
              checked ? "text-[#0B1220]" : "text-[#1A1A1A]"
            } ${optionClassName}`.trim()}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                checked ? "border-[#1E765F] bg-[#1E765F]/10" : "border-[#D5DBE4] bg-white"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full transition ${checked ? "bg-[#1E765F]" : "bg-transparent"}`}
              />
            </span>
            <span>{option.label}</span>
          </span>
        )}
      </RadioGroup.Option>
    ))}
  </RadioGroup>
);

export default CircleRadioGroup;
