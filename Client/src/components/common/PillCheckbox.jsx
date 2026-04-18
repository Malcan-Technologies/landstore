"use client";

import React from "react";
import { Switch } from "@headlessui/react";
import Tick from "@/components/svg/Tick";

const PillCheckbox = ({
  label,
  checked,
  onChange,
  className = "",
  showTick = true,
  tickIcon,
  checkedClassName = "border-green-secondary/39 text-green-secondary",
  uncheckedClassName = "border-border-input  text-gray2",
  ...props
}) => {
  const baseClasses =
    "cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-primary/60 focus-visible:ring-offset-2";

  const computedClasses = [baseClasses, checked ? checkedClassName : uncheckedClassName, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Switch.Group as="div" className="inline-flex">
      <Switch checked={checked} onChange={onChange} className={computedClasses} {...props}>
        <span className="flex items-center gap-1.5">
          {checked && showTick ? tickIcon ?? <Tick size={12} /> : null}
          <Switch.Label as="span" className="text-current" passive>
            {label}
          </Switch.Label>
        </span>
      </Switch>
    </Switch.Group>
  );
};

export default PillCheckbox;
