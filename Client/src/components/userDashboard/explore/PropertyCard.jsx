"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

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
  variant = "default",
}) => {
  const router = useRouter();
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
    updatedAt,
    dateTime,
    location,
  } = land;

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveToggle = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setIsSaved((previous) => !previous);
  };

  const renderHeartIcon = (width, height) => {
    if (isSaved) {
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 20 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 15.2C9.7003 15.2 9.29142 15.0867 8.78521 14.7909C8.37698 14.5523 7.96313 14.2269 7.56297 13.9116C7.35179 13.7452 7.12947 13.574 6.90028 13.3975C5.88418 12.6149 4.73225 11.7275 3.81195 10.6912C2.67027 9.40581 1.8 7.81312 1.8 5.7C1.8 3.57454 3.00695 1.73093 4.75333 0.932875C6.40787 0.176768 8.45937 0.38399 10 2.01758C11.5406 0.38399 13.5921 0.176768 15.2467 0.932875C16.9931 1.73093 18.2 3.57454 18.2 5.7C18.2 7.81312 17.3297 9.40581 16.188 10.6912C15.2678 11.7275 14.1158 12.6149 13.0997 13.3975C12.8705 13.574 12.6482 13.7452 12.437 13.9116C12.0369 14.2269 11.623 14.5523 11.2148 14.7909C10.7086 15.0867 10.2997 15.2 10 15.2Z"
            fill="#EF4444"
          />
        </svg>
      );
    }

    return <Heart width={width} height={height} color="currentColor" />;
  };

  if (variant === "compact") {
    const compactCardContent = (
      <article
        onClick={() => {
          if (id) {
            router.push(`/property/${id}`);
          }
        }}
        className={`w-auto cursor-pointer rounded-lg border border-white/70 bg-white px-2 py-1.5 transition ${className}`.trim()}
      >
        <div className="flex items-stretch gap-3">
          <div className="relative h-auto min-h-full w-28 shrink-0 self-stretch overflow-hidden rounded-md bg-[#F8E5DD]">
            <Image
              src={image}
              alt={title}
              fill
              sizes="90px"
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] font-medium text-gray5">
                  <span className="flex items-center gap-1">
                    <Building size={12} color="currentColor" className="text-gray5" />
                    <span className="truncate">{category}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Bag size={12} color="currentColor" className="text-gray5" />
                    <span className="truncate">{area}</span>
                  </span>
                  {code ? <span className="truncate text-[10px] text-gray7">{code}</span> : null}
                </div>

                <h3 className="flex items-center gap-1.5 text-[14px] font-semibold leading-5 text-gray2">
                  <Pointer size={13} color="currentColor" className="shrink-0 text-green-secondary" />
                  <span className="block truncate">{title}</span>
                </h3>

                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-green-secondary">
                  {dealTags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full border border-border-green bg-activebg px-2 py-0.5 text-gray2">
                      {tag}
                    </span>
                  ))}
                  {dealTags.length > 2 ? <span className="text-gray5">{extraDealsLabel}</span> : null}
                </div>

                <div className="flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-gray2">{price}</p>
                    <p className="text-[10px] text-gray5">Estimated valuation</p>
                  </div>
                  <p className="shrink-0 text-[11px] font-medium text-gray5">{valuation}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveToggle}
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition ${
                  isSaved ? "text-red-500" : "text-gray5"
                }`.trim()}
                aria-label={isSaved ? "Remove from saved" : "Save card"}
                aria-pressed={isSaved}
              >
                {renderHeartIcon(12, 12)}
              </button>
            </div>
          </div>
        </div>
      </article>
    );

    return compactCardContent;
  }

  return (
    <article className={`h-fit w-90 self-start rounded-xl bg-white shadow-[0_10px_35px_rgba(15,61,46,0.05)] ${className}`.trim()}>
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
          onClick={handleSaveToggle}
          className={`absolute right-4 top-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white shadow transition ${
            isSaved ? "text-red-500" : "text-gray2"
          }`.trim()}
          aria-label={isSaved ? "Remove from shortlist" : "Save to shortlist"}
          aria-pressed={isSaved}
        >
          {renderHeartIcon(16, 16)}
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
        <div className="flex justify-between items-center gap-3 text-[12px] font-medium text-gray5">
          <div className="flex items-center gap-3">

          <span className="flex items-center gap-1.5">
            <Building size={14} color="currentColor" className="text-gray5" />
            {category}
          </span>
          <span className="flex items-center gap-1.5">
            <Bag size={14} color="currentColor" className="text-gray5" />
            {area}
          </span>
          </div>
          <span className="rounded-lg border border-border-card px-2 py-1 text-gray7">{code}</span>
        </div>

        <h3 className="flex items-center gap-2 text-[18px] font-bold text-gray2">
          <Pointer size={18} color="currentColor" className="text-green-secondary" />
          {title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-green-secondary">
          {dealTags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full border border-border-card  px-3 py-1 text-gray7">
              {tag}
            </span>
          ))}
          {dealTags.length > 2 ? <span className="text-green-logo">{extraDealsLabel}</span> : null}
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
          className="mt-1 w-full justify-center rounded-xl px-4 py-2 text-[14px] font-medium !shadow-none"
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
