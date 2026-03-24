import React from "react";

const StatCard = ({
  icon,
  iconBgClassName = "bg-[#FFF7E8]",
  value,
  label,
  description,
}) => {
  return (
    <div className="flex h-full gap-10 sm:gap-6 flex-col justify-center sm:justify-between rounded-2xl border border-cardborder bg-white px-3 py-3 sm:px-6">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBgClassName}`}>{icon}</div>

      <div className=" w-full flex flex-col justify-between">
        <div className="flex items-end gap-2">
          <span className="text-[18px] font-semibold leading-none text-[#18181B] sm:text-[20px]">{value}</span>
          <span className="text-[12px] font-medium uppercase tracking-[0.02em] text-[#A1A1AA]">{label}</span>
        </div>
        <p className="sm:mt-2 text-[14px] font-medium leading-none text-[#52525B]">{description}</p>
      </div>
    </div>
  );
};

export default StatCard;
