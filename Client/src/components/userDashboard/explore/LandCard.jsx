"use client";

import Image from "next/image";
import React from "react";
import Arrow from "@/components/svg/Arrow";
import Button from "@/components/common/Button";
import Heart from "@/components/svg/Heart";
import Pointer from "@/components/svg/Pointer";
import Building from "@/components/svg/Building";
import Bag from "@/components/svg/Bag";

const LandCard = ({
  land,
}) => {
  const {
    status = "Active",
    statusColor = "",
    image,
    category,
    area,
    code,
    title = "Land listing image",
    dealTags = [],
    extraDealsLabel = "+2 more",
    price,
    valuation,
  } = land;

  return (
    <article className="rounded-xl w-90 border border-[#E4E9F0] bg-white shadow-[0_10px_35px_rgba(15,61,46,0.05)]">
      <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
          unoptimized
        />
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-[#111] shadow"
          aria-label="Save to shortlist"
        >
          <Heart size={16} color="#1A1A1A" />
        </button>
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[12px] font-semibold ${
            status?.toLowerCase() === "active" ? "text-active" : "text-white"
          }`}
          style={{
            backgroundColor:
              status?.toLowerCase() === "active" ? "var(--color-activebg)" : statusColor,
          }}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 space-y-3 p-4 pt-0">
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-[#6B7280]">
          <span className="flex items-center gap-1.5">
            <Building size={14} color="#1A1A1A" />
            {category}
          </span>
          <span className="flex items-center gap-1.5">
            <Bag size={14} color="#6B7280" />
            {area}
          </span>
          <span className="rounded-lg bg-[#F4F6F9] px-2 py-1 text-[#4F4F4F]">{code}</span>
        </div>

        <h3 className="flex items-center gap-2 text-[18px] font-semibold text-[#0B1220]">
          <Pointer size={18} color="#1E765F" />
          {title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#1E765F]">
          {dealTags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full border border-[#B7D7C8] bg-[#F3FBF7] px-3 py-1 text-[#0B1220]">
              {tag}
            </span>
          ))}
          {dealTags.length > 2 ? <span className="text-[#6B7280]">{extraDealsLabel}</span> : null}
        </div>

        <div className="flex items-center justify-between text-[#0B1220]">
          <div>
            <p className="text-[20px] font-semibold">{price}</p>
            <p className="text-[12px] text-[#6B7280]">Estimated valuation</p>
          </div>
          <p className="text-[13px] font-medium text-[#6B7280]">{valuation}</p>
        </div>

        <Button
          href="#"
          className="mt-1 w-full justify-center rounded-xl px-4 py-2 text-[14px] font-medium"
          colorClass="bg-[#E4F5EE] text-[#0B8F60] hover:bg-[#d5f0e5]"
        >
          <span className="flex items-center justify-center gap-2">
            View details
            <Arrow size={14} color="#0B8F60" />
          </span>
        </Button>
      </div>
    </article>
  );
};

export default LandCard;
