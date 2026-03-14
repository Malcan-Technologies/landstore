import Image from "next/image";

import Road from "@/components/svg/Road";
import Building from "@/components/svg/Building";

const InfoWindowCard = ({ image, price, area, category }) => (
  <div className="relative inline-flex flex-col items-center text-white">
    <div className="flex min-w-56 max-w-xs items-stretch rounded-2xl bg-gray2 ">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-l-2xl">
        {image ? (
          <Image
            src={image}
            alt={category ?? "Land highlight"}
            fill
            className="object-cover"
            sizes="96px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray7 text-xs text-gray5">
            No Image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 py-3 text-sm">
        <p className="text-base font-semibold tracking-tight">{price}</p>
        <div className="flex items-center gap-2 text-white">
          <Road size={15} color="white" aria-hidden />
          <span className="text-xs uppercase tracking-wide opacity-90">{area}</span>
        </div>
        <div className="flex items-center gap-2 text-white">
          <Building size={15} color="white" aria-hidden />
          <span className="text-xs uppercase tracking-wide opacity-90">{category}</span>
        </div>
      </div>
    </div>
    <span className="-mt-1.5 mb-0.5 block h-3 w-3 rotate-45 bg-gray2 shadow-[0_10px_25px_rgba(0,0,0,0.25)]"></span>
  </div>
);

export default InfoWindowCard;
