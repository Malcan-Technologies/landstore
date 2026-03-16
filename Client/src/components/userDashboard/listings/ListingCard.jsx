import Delete from "@/components/svg/Delete";
import Edit from "@/components/svg/Edit";
import EyeOpen from "@/components/svg/EyeOpen";
import Bag from "@/components/svg/Bag";
import Calendar from "@/components/svg/Calendar";
import Pointer from "@/components/svg/Pointer";

const statusStyles = {
  active: "bg-[#EAF8F1] text-green-secondary",
  draft: "bg-[#F3F4F6] text-gray5",
  review: "bg-[#FFF7E8] text-[#F59E0B]",
  reserved: "bg-[#EEF4FF] text-[#2563EB]",
};

const ListingCard = ({ listing }) => {
  const statusClassName = statusStyles[listing.statusKey] ?? statusStyles.active;

  return (
    <article className="rounded-2xl border border-border-card bg-white p-3 shadow-[0px_4px_18px_rgba(15,61,46,0.04)]">
      <div className="flex gap-4">
        <div className="relative w-64 overflow-hidden rounded-xl">
          <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-background-primary px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] text-gray5">
                  {listing.code}
                </span>
                <span className={`rounded-md px-2 py-1 text-[10px] font-medium capitalize ${statusClassName}`}>
                  {listing.statusLabel}
                </span>
              </div>

              <h2 className="mt-3 flex items-center gap-2 text-[16px] font-semibold text-gray2 md:text-[18px]">
                <Pointer size={17} color="var(--color-green-secondary)" />
                <span className="truncate">{listing.title}</span>
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-gray5">
                <span className="inline-flex items-center gap-1.5">
                  <Bag size={14} color="var(--color-gray5)" />
                  <span>{listing.category}</span>
                </span>
                <span>{listing.area}</span>
                {listing.dealTags.map((tag) => (
                  <span key={tag} className="rounded-md border border-border-input px-2 py-0.5 text-[11px] font-medium text-gray5">
                    {tag}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} color="var(--color-gray5)" />
                  <span>Updated {listing.updatedAt}</span>
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[18px] font-semibold text-gray2 md:text-[20px]">{listing.price}</p>
              <p className="text-[12px] text-gray5">Estimated Valuation</p>
            </div>
          </div>

          <div className="mt-4 border-t border-border-card pt-4">
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {listing.actions.map((action) => {
                  if (action.type === "delete") {
                    return (
                      <button
                        key={action.label}
                        type="button"
                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#FECACA] px-3 text-[12px] font-medium text-[#EF4444] transition hover:bg-[#FEF2F2]"
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
                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-border-input px-3 text-[12px] font-medium text-gray2 transition hover:bg-background-primary"
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
                        className="inline-flex h-8 items-center rounded-lg bg-[#EAF8F1] px-3 text-[12px] font-medium text-green-secondary transition hover:bg-[#DCF3E8]"
                      >
                        {action.label}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={action.label}
                      type="button"
                      className="inline-flex h-8 items-center rounded-lg border border-border-input px-3 text-[12px] font-medium text-gray2 transition hover:bg-background-primary"
                    >
                      {action.type === "default" ? <Edit size={16} color="currentColor" className="mr-2" /> : null}
                      {action.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-end gap-8 text-right">
                <div>
                  <p className="text-[18px] font-semibold text-gray2">{listing.views}</p>
                  <p className="text-[12px] text-gray5">Views</p>
                </div>
                <div>
                  <p className="text-[18px] font-semibold text-gray2">{listing.interests}</p>
                  <p className="text-[12px] text-gray5">Interests</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ListingCard;
