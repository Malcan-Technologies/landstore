import CircleRadioGroup from "@/components/common/CircleRadioGroup";
import SelectDropdown from "@/components/common/SelectDropdown";
import Calendar from "@/components/svg/Calendar";

const negeriOptions = [
  { value: "selangor", label: "Selangor" },
  { value: "johor", label: "Johor" },
];
const daerahOptions = [
  { value: "hulu-langat", label: "Hulu Langat" },
  { value: "petaling", label: "Petaling" },
];
const leaseOptions = [
  { value: "30-years", label: "30 Years" },
  { value: "60-years", label: "60 Years" },
  { value: "99-years", label: "99 Years" },
];
const yearOptions = Array.from({ length: 5 }, (_, index) => {
  const year = 2025 + index;
  return { value: String(year), label: String(year) };
});
const days = [null, null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, null];

const LocationStep = ({ formData, updateField }) => {
  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <SelectDropdown
            label="Negeri"
            value={formData.negeri}
            onChange={(value) => updateField("negeri", value)}
            options={negeriOptions}
            placeholder="Select Negeri"
          />
          <SelectDropdown
            label="Daerah"
            value={formData.daerah}
            onChange={(value) => updateField("daerah", value)}
            options={daerahOptions}
            placeholder="Select Daerah"
          />
          <div>
            <label className="mb-2 block text-[13px] font-medium text-gray2">Mukim</label>
            <input
              value={formData.mukim}
              onChange={(event) => updateField("mukim", event.target.value)}
              placeholder="e.g Hulu Langat"
              className="h-11 w-full rounded-xl border border-border-input bg-white px-3.5 text-[14px] text-gray2 outline-none transition focus:border-green-secondary"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-medium text-gray2">Seksyen</label>
            <input
              value={formData.seksyen}
              onChange={(event) => updateField("seksyen", event.target.value)}
              placeholder="e.g Hulu Langat"
              className="h-11 w-full rounded-xl border border-border-input bg-white px-3.5 text-[14px] text-gray2 outline-none transition focus:border-green-secondary"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-medium text-gray2">Lot number (Admin only)</label>
            <input
              value={formData.lotNumber}
              onChange={(event) => updateField("lotNumber", event.target.value)}
              placeholder="Required for verification"
              className="h-11 w-full rounded-xl border border-border-input bg-white px-3.5 text-[14px] text-gray2 outline-none transition focus:border-green-secondary"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-medium text-gray2">Set Approximate Location</p>
          <div className="relative h-[220px] overflow-hidden rounded-2xl border border-border-input bg-[#F7F7F7]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(219,219,219,0.55)_1px,transparent_1px),linear-gradient(rgba(219,219,219,0.55)_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full bg-font2-green/18">
                <div className="h-[90px] w-[90px] rounded-full bg-font2-green/20" />
                <div className="absolute rounded-2xl bg-[#2F2F2F] px-4 py-3 text-white shadow-xl">
                  <p className="text-[12px] font-semibold">RM 108K</p>
                  <p className="mt-1 text-[11px] text-white/70">250 Acres</p>
                  <p className="text-[11px] text-white/70">Industrial</p>
                </div>
                <div className="absolute bottom-5 right-0 rounded-xl bg-white px-3 py-2 text-[10px] font-medium text-gray2 shadow-md">
                  LAT 3.114 / LNG 101.69
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[12px] leading-5 text-gray5">
            Drag the map to center on the approximate area. A randomized jitter will be applied for security.
          </p>
        </div>
      </div>

      <div className="border-t border-border-card pt-6">
        <p className="mb-4 text-[13px] font-medium text-gray2">Title type</p>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="inline-flex w-full rounded-xl border border-border-input bg-white p-1">
              <button
                type="button"
                onClick={() => updateField("titleType", "freehold")}
                className={`h-10 flex-1 rounded-lg text-[13px] font-medium transition ${
                  formData.titleType === "freehold" ? "bg-[#2F2F2F] text-white" : "text-gray5"
                }`}
              >
                Freehold
              </button>
              <button
                type="button"
                onClick={() => updateField("titleType", "leasehold")}
                className={`h-10 flex-1 rounded-lg text-[13px] font-medium transition ${
                  formData.titleType === "leasehold" ? "bg-[#2F2F2F] text-white" : "text-gray5"
                }`}
              >
                Leasehold
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-[13px] font-medium text-gray2">Leasehold start year</label>
              <div className="relative">
                <input
                  value={formData.leaseStartDate}
                  onChange={(event) => updateField("leaseStartDate", event.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="h-11 w-full rounded-xl border border-border-input bg-white px-3.5 pr-10 text-[14px] text-gray2 outline-none transition focus:border-green-secondary"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray5">
                  <Calendar size={16} color="currentColor" />
                </span>
              </div>

              <div className="mt-3 rounded-2xl border border-border-input bg-white p-4 shadow-[0px_8px_24px_rgba(15,61,46,0.08)]">
                <SelectDropdown
                  value={formData.calendarYear}
                  onChange={(value) => updateField("calendarYear", value)}
                  options={yearOptions}
                  className="mb-3"
                  buttonClassName="h-10 rounded-lg"
                />
                <div className="mb-3 flex items-center justify-between text-[13px] font-medium text-gray2">
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-input text-gray5">‹</button>
                  <span>November 2024</span>
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-input text-gray5">›</button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-[11px] text-gray5">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map((day) => <span key={day}>{day}</span>)}
                  {days.map((day, index) => (
                    <span
                      key={`${day ?? 'empty'}-${index}`}
                      className={`flex h-8 items-center justify-center rounded-lg text-[12px] ${day === 7 ? "bg-[#2F2F2F] text-white" : day ? "text-gray2" : "text-transparent"}`}
                    >
                      {day ?? "."}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <SelectDropdown
              label="Leasehold Period"
              value={formData.leasePeriod}
              onChange={(value) => updateField("leasePeriod", value)}
              options={leaseOptions}
              placeholder="Select period"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;
