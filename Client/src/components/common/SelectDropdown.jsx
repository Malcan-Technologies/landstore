"use client";

import React, { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import Tick from "@/components/svg/Tick";

const SelectDropdown = ({
  value,
  onChange,
  options = [],
  label,
  name,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  buttonClassName = "",
  optionClassName = "",
  renderValue,
  ...props
}) => {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Listbox value={value} onChange={onChange} name={name} disabled={disabled} {...props}>
      <div className={`relative ${className}`.trim()}>
        {label ? (
          <Listbox.Label className="mb-1.5 block text-[14px] font-medium text-[#4A4A4A] md:text-[15px]">
            {label}
          </Listbox.Label>
        ) : null}
        <Listbox.Button
          className={`flex w-full items-center justify-between gap-3 rounded-xl border border-[#D7DEE7] bg-white px-3.5 py-2 text-left text-[14px] text-[#1A1A1A] outline-none transition focus-visible:border-green-primary focus-visible:ring-2 focus-visible:ring-green-primary/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-[#F4F5F7] disabled:text-[#A1A1A1] ${buttonClassName}`.trim()}
        >
          <span className="flex-1 truncate">
            {selectedOption ? (
              renderValue ? renderValue(selectedOption) : selectedOption.label
            ) : (
              <span className="text-[#B3B3B3]">{placeholder}</span>
            )}
          </span>
          <span className="text-[#6B6B6B]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4.5 6.5L8 10L11.5 6.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-[#E4E9F0] bg-white py-1 shadow-xl focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  `flex cursor-pointer items-center justify-between px-3.5 py-2 text-[14px] transition ${
                    active ? "bg-[#F3FBF7] text-green-primary" : "text-[#1A1A1A]"
                  } ${optionClassName}`.trim()
                }
              >
                {({ selected }) => (
                  <>
                    <span className="flex items-center gap-2 truncate">
                      {option.icon ? <option.icon size={16} /> : null}
                      <span>{option.label}</span>
                    </span>
                    {selected ? (
                      <span className="text-green-primary">
                        <Tick size={12} color="currentColor" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default SelectDropdown;
