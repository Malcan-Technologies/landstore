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
            className={`flex cursor-pointer items-center gap-2 text-[14px] font-medium transition ${checked ? "text-gray2" : "text-gray2"} ${optionClassName}`.trim()}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${checked ? "border-green-secondary bg-green-secondary/10" : "border-border-input bg-white"}`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full transition ${checked ? "bg-green-secondary" : "bg-transparent"}`}
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
