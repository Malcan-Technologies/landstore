"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import Road from "@/components/svg/Road";
import Building from "@/components/svg/Building";

const fallbackImageSrc = "/Land.jpg";

const resolveImageSrc = (image) => {
  if (typeof image === "string" && image.trim()) {
    return image.trim();
  }

  return fallbackImageSrc;
};

const InfoWindowCard = ({ image, price, area, category }) => {
  const [resolvedImageSrc, setResolvedImageSrc] = useState(resolveImageSrc(image));

  useEffect(() => {
    setResolvedImageSrc(resolveImageSrc(image));
  }, [image]);

  return (
    <div className="relative inline-flex flex-col items-center text-white">
      <div className="flex w-auto max-w-xs items-stretch rounded-lg bg-gray2 ">
        <div className="relative h-auto w-24 shrink-0 overflow-hidden rounded-l-lg">
          <Image
            src={resolvedImageSrc}
            alt={category ?? "Land highlight"}
            fill
            className="object-cover"
            sizes="96px"
            unoptimized
            onError={() => {
              if (resolvedImageSrc !== fallbackImageSrc) {
                setResolvedImageSrc(fallbackImageSrc);
              }
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2 px-4 py-3 text-sm">
          <p className="text-base font-bold tracking-tight">{price}</p>
          <div className="flex items-center gap-2 text-white">
            <Road size={12} color="var(--color-gray4)" aria-hidden />
            <span className="text-xs tracking-wide opacity-90 font-medium text-gray3">{area}</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Building size={12} color="var(--color-gray4)" aria-hidden />
            <span className="text-xs tracking-wide opacity-90 font-medium text-gray3">{category}</span>
          </div>
        </div>
      </div>
      <span className="-mt-1.5 mb-0.5 block h-3 w-3 rotate-45 bg-gray2 shadow-[0_10px_25px_rgba(0,0,0,0.25)]"></span>
    </div>
  );
};

export default InfoWindowCard;
