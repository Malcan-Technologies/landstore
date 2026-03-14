"use client";

import Image from "next/image";
import React from "react";
import Arrow from "@/components/svg/Arrow";
import Button from "@/components/common/Button";
import Heart from "@/components/svg/Heart";
import Pointer from "@/components/svg/Pointer";
import Building from "@/components/svg/Building";
import Bag from "@/components/svg/Bag";

const PropertyCard = ({
  land,
  className = "",
  showMenuButton = false,
  menuButtonLabel = "Open card menu",
  onMenuClick,
}) => {
  const {
    id,
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
    <article className={`w-90 rounded-xl bg-white shadow-[0_10px_35px_rgba(15,61,46,0.05)] ${className}`.trim()}>
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
          className="absolute right-4 top-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-gray2 shadow"
          aria-label="Save to shortlist"
        >
          <Heart size={16} color="currentColor" />
        </button>
        {showMenuButton ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="absolute bottom-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray7 shadow-sm"
            aria-label={menuButtonLabel}
          >
            <span className="text-lg leading-none">⋮</span>
          </button>
        ) : null}
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
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-gray5">
          <span className="flex items-center gap-1.5">
            <Building size={14} color="currentColor" className="text-gray5" />
            {category}
          </span>
          <span className="flex items-center gap-1.5">
            <Bag size={14} color="currentColor" className="text-gray5" />
            {area}
          </span>
          <span className="rounded-lg border border-border-card px-2 py-1 text-gray7">{code}</span>
        </div>

        <h3 className="flex items-center gap-2 text-[18px] font-semibold text-gray2">
          <Pointer size={18} color="currentColor" className="text-green-secondary" />
          {title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-green-secondary">
          {dealTags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full border border-border-green bg-activebg px-3 py-1 text-gray2">
              {tag}
            </span>
          ))}
          {dealTags.length > 2 ? <span className="text-gray5">{extraDealsLabel}</span> : null}
        </div>

        <div className="flex items-center justify-between text-gray2">
          <div>
            <p className="text-[20px] font-semibold">{price}</p>
            <p className="text-[12px] text-gray5">Estimated valuation</p>
          </div>
          <p className="text-[13px] font-medium text-gray5">{valuation}</p>
        </div>

        <Button
          href={id ? `/property/${id}` : undefined}
          className="mt-1 w-full justify-center rounded-xl px-4 py-2 text-[14px] font-medium"
          colorClass="bg-activebg text-green-primary hover:bg-font-green"
        >
          <span className="flex items-center justify-center gap-2 text-green-primary">
            View details
            <Arrow size={14} color="currentColor" />
          </span>
        </Button>
      </div>
    </article>
  );
};

export default PropertyCard;
