import Delete from "@/components/svg/Delete";
import Edit from "@/components/svg/Edit";
import EyeOpen from "@/components/svg/EyeOpen";
import Bag from "@/components/svg/Bag";
import Calendar from "@/components/svg/Calendar";
import Pointer from "@/components/svg/Pointer";
import Building from "@/components/svg/Building";

const statusStyles = {
  active: "bg-[#EAF8F1] text-green-secondary",
  draft: "bg-[#F3F4F6] text-gray5",
  review: "bg-[#FFF7E8] text-[#F59E0B]",
  reserved: "bg-[#EEF4FF] text-[#2563EB]",
};

const ListingCard = ({ listing, showFooter = true }) => {
  const statusClassName =
    statusStyles[listing.statusKey] ?? statusStyles.active;

  return (
    <article className="rounded-2xl border border-border-card bg-white p-3 py-4 shadow-[0px_4px_18px_rgba(15,61,46,0.04)]">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-auto sm:w-54  lg:w-60 xl:w-60 w-auto overflow-hidden rounded-xl">
          <img
            src={listing.image}
            alt={listing.title}
            className="h-full w-full object-cover"
          />
          <span
            className={`absolute left-2 top-2 z-10 rounded-full px-2 py-1 text-[9px] font-medium capitalize sm:hidden ${statusClassName}`}
          >
            {listing.statusLabel}
          </span>
        </div>

        <div className={`flex min-w-0 flex-1 flex-col ${showFooter ? "" : "justify-center"}`}>
          <div className="flex items-start w-full gap-2 ">
            <div className="w-full flex flex-col min-w-0 ">
              <div className="flex w-full justify-between gap-2 ">
                <div className="flex min-w-0 items-start gap-2 h-fit">
                  <span className="hidden rounded-md bg-background-primary px-2 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-gray5 sm:inline-flex sm:text-[10px]">
                    {listing.code}
                  </span>
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium text-gray5 sm:hidden">
                    <span className="inline-flex items-center gap-1">
                      <Bag size={14} color="var(--color-gray5)" />
                      <span>{listing.category}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Building size={14} color="var(--color-gray5)" />
                      {listing.area}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={14} color="var(--color-gray5)" />
                      <span>Updated {listing.updatedAt}</span>
                    </span>
                  </div>
                  <span
                    className={`rounded-md hidden sm:block px-2 py-1 sm:text-[10px] text-[9px] font-medium capitalize ${statusClassName}`}
                  >
                    {listing.statusLabel}
                  </span>
                </div>
                <div className="hidden sm:block shrink-0 text-right lg:mt-0">
                  <p className="text-[18px] font-bold text-gray2 xl:text-[26px] lg:text-[22px]">
                    {listing.price}
                  </p>
                  <p className="text-[9px] lg:text-[12px] text-gray5 font-medium lg:mt-3">
                    Estimated Valuation
                  </p>
                </div>
              </div>

              <h2 className="flex  lg:-mt-4 items-center gap-2 text-[18px] font-bold text-gray2 lg:text-[22px] xl:text-[28px]">
                <Pointer color="var(--color-green-secondary)" className="h-[15px] w-3 shrink-0 sm:h-4 sm:w-[13px] lg:h-[28px] lg:w-[18px]" />
                <span className="truncate">{listing.title}</span>
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 sm:gap-y-0.5 xl:text-[16px] sm:text-[12px] text-[10px] font-medium text-gray5">
                <span className="rounded-md bg-background-primary px-2 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-gray5 sm:hidden">
                  {listing.code}
                </span>
                <span className="hidden items-center gap-1.5 sm:inline-flex">
                  <Bag size={14} color="var(--color-gray5)" />
                  <span>{listing.category}</span>
                </span>
                <span className="hidden items-center gap-1.5 sm:inline-flex">
                  <Building size={14} color="var(--color-gray5)" />
                  {listing.area}
                </span>
                {listing.dealTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-2xl border border-border-input px-2 py-1 xl:text-[14px] lg:text-[12px] text-[10px] font-semibold text-gray5"
                  >
                    {tag}
                  </span>
                ))}
                <span className="hidden items-center gap-1.5 sm:inline-flex">
                  <Calendar size={14} color="var(--color-gray5)" />
                  <span>Updated {listing.updatedAt}</span>
                </span>
              </div>
            </div>
          </div>

          {showFooter ? (
            <div className="sm:mt-4 sm:border-t border-border-card sm:pt-4 pt-2">
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-2 sm:gap-4">
                <div className="flex sm:flex-row flex-col sm:w-auto w-full items-start gap-2">
                  {listing.actions.map((action) => {
                    if (action.type === "delete") {
                      return (
                        <button
                          key={action.label}
                          type="button"
                          className="inline-flex h-8 sm:w-auto w-full justify-center sm:justify-start items-center gap-2 rounded-lg border border-[#FECACA] px-3 text-[12px] font-medium text-[#EF4444] transition hover:bg-[#FEF2F2]"
                        >
                          <Delete size={16} className="text-current" />
                          <span>{action.label}</span>
                        </button>
                      );
                    }

                    if (action.type === "view") {
                      return (
                        <button
                          key={action.label}
                          type="button"
                          className="inline-flex h-8 sm:w-auto w-full justify-center sm:justify-start items-center gap-2 rounded-lg border border-border-input px-3 text-[12px] font-medium text-gray2 transition hover:bg-background-primary"
                        >
                          <EyeOpen size={16} color="currentColor" />
                          <span>{action.label}</span>
                        </button>
                      );
                    }

                    if (action.type === "request") {
                      return (
                        <button
                          key={action.label}
                          type="button"
                          className="inline-flex h-8 sm:w-auto w-full justify-center sm:justify-start items-center rounded-lg bg-[#EAF8F1] px-2 py-2 sm:text-[12px] text-[9px] font-semibold text-green-secondary transition hover:bg-[#DCF3E8]"
                        >
                          {action.label}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={action.label}
                        type="button"
                        className="inline-flex h-8 sm:w-auto w-full justify-center sm:justify-start items-center rounded-lg border border-border-input px-3 sm:text-[12px] text-[9px] font-medium text-gray2 transition hover:bg-background-primary"
                      >
                        {action.type === "default" ? (
                          <Edit size={16} color="currentColor" className="mr-2" />
                        ) : null}
                        {action.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between w-full gap-3 text-right sm:w-auto sm:justify-start sm:gap-8">
                  <div className="block sm:hidden shrink-0 text-left lg:mt-0">
                  <p className="text-[18px] font-bold text-gray2 xl:text-[26px] lg:text-[22px]">
                    {listing.price}
                  </p>
                  <p className="text-[9px] lg:text-[12px] text-gray5 font-medium lg:mt-3">
                    Estimated Valuation
                  </p>
                </div>
                  <div className="flex gap-3">

                  <div className="flex sm:flex-col gap-1 items-center ">
                    <p className="sm:text-[16px] text-[13px] font-bold text-gray2">
                      {listing.views}
                    </p>
                    <p className="sm:text-[14px] text-[11px] text-gray5">Views</p>
                  </div>
                  <div className="flex sm:flex-col gap-1 items-center ">
                    <p className="sm:text-[16px] text-[13px] font-bold text-gray2">
                      {listing.interests}
                    </p>
                    <p className="sm:text-[14px] text-[11px] text-gray5">Interests</p>
                  </div>
                </div>
                  </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default ListingCard;
