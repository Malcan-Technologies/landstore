import CircleRadioGroup from "@/components/common/CircleRadioGroup";
import SelectDropdown from "@/components/common/SelectDropdown";
import MapView from "@/components/userDashboard/explore/MapView";
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
  const locationMarker = {
    id: "listing-location-marker",
    image: formData.photos?.[0] ? URL.createObjectURL(formData.photos[0]) : null,
    price: formData.pricePerSqft ? `RM ${formData.pricePerSqft}` : "Price pending",
    area: formData.landArea ? `${formData.landArea} ${formData.areaUnit}` : "Area pending",
    category: formData.category || "Land listing",
    lat: Number(formData.latitude),
    lng: Number(formData.longitude),
  };

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8">
      <div className="grid items-start gap-6 sm:gap-7 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
        <div className="space-y-3 sm:space-y-4">
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
            <label className="mb-2 block text-[12px] font-medium text-gray2 sm:text-[13px]">Mukim</label>
            <input
              value={formData.mukim}
              onChange={(event) => updateField("mukim", event.target.value)}
              placeholder="e.g Hulu Langat"
              className="h-9 w-full rounded-xl border border-border-input bg-white px-3 text-[12px] text-gray2 outline-none transition focus:border-green-secondary sm:h-10 sm:px-3.5 sm:text-[13px] md:h-11 md:text-[14px]"
            />
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-medium text-gray2 sm:text-[13px]">Seksyen</label>
            <input
              value={formData.seksyen}
              onChange={(event) => updateField("seksyen", event.target.value)}
              placeholder="e.g Hulu Langat"
              className="h-9 w-full rounded-xl border border-border-input bg-white px-3 text-[12px] text-gray2 outline-none transition focus:border-green-secondary sm:h-10 sm:px-3.5 sm:text-[13px] md:h-11 md:text-[14px]"
            />
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-medium text-gray2 sm:text-[13px]">Lot number (Admin only)</label>
            <input
              value={formData.lotNumber}
              onChange={(event) => updateField("lotNumber", event.target.value)}
              placeholder="Required for verification"
              className="h-9 w-full rounded-xl border border-border-input bg-white px-3 text-[12px] text-gray2 outline-none transition focus:border-green-secondary sm:h-10 sm:px-3.5 sm:text-[13px] md:h-11 md:text-[14px]"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-medium text-gray2 sm:text-[13px]">Set Approximate Location</p>
          <div className="relative">
            <MapView
              markers={[locationMarker]}
              center={{ lat: Number(formData.latitude), lng: Number(formData.longitude) }}
              zoom={11}
              defaultActiveMarkerId="listing-location-marker"
              hideMarkerPin
              showCenterRings
              infoWindowOffset={8}
              containerClassName="min-h-[300px] rounded-2xl border-border-input bg-background-primary shadow-[0px_10px_28px_rgba(15,61,46,0.06)]"
              mapClassName="h-[300px] w-full"
              ringClassName="z-1"
              onMapClick={({ lat, lng }) => {
                updateField("latitude", Number(lat.toFixed(6)));
                updateField("longitude", Number(lng.toFixed(6)));
              }}
            />
            <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg bg-white px-2 py-1.5 text-[8px] font-medium text-gray2 shadow-md sm:px-2.5 sm:py-1.5 sm:text-[9px] md:rounded-xl md:px-3 md:py-2 md:text-[10px]">
              LAT {Number(formData.latitude).toFixed(3)} / LNG {Number(formData.longitude).toFixed(2)}
            </div>
          </div>
          <p className="mt-2.5 text-center text-[10px] leading-4 text-gray5 sm:mt-3 sm:text-[11px] sm:leading-5 md:text-[12px]">
            Drag the map to center on the approximate area. A randomized jitter will be applied for security.
          </p>
        </div>
      </div>

      <div className="border-t border-border-card pt-5 sm:pt-6">
        <p className="mb-3 text-[12px] font-medium text-gray2 sm:mb-4 sm:text-[13px]">Title type</p>
        <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={() => updateField("titleType", "freehold")}
                className={`h-9 flex-1 rounded-xl border text-[11px] font-medium transition sm:h-10 sm:text-[12px] md:text-[13px] ${
                formData.titleType === "freehold" ? "border-[#2F2F2F] bg-[#2F2F2F] text-white" : "border-border-input bg-white text-gray5 hover:border-[#D3D7DC]"
              }`}
            >
              Freehold
            </button>
            <button
              type="button"
              onClick={() => updateField("titleType", "leasehold")}
                className={`h-9 flex-1 rounded-xl border text-[11px] font-medium transition sm:h-10 sm:text-[12px] md:text-[13px] ${
                formData.titleType === "leasehold" ? "border-[#2F2F2F] bg-[#2F2F2F] text-white" : "border-border-input bg-white text-gray5 hover:border-[#D3D7DC]"
              }`}
            >
              Leasehold
            </button>
            </div>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          <div>
            

            <div className="mt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[12px] font-medium text-gray2 sm:text-[13px]">Leasehold start year</label>
                  <div className="relative">
                    <input
                      value={formData.leaseStartDate}
                      onChange={(event) => updateField("leaseStartDate", event.target.value)}
                      placeholder="MM/DD/YYYY"
                      className="h-9 w-full rounded-xl border border-border-input bg-white px-3 pr-9 text-[12px] text-gray2 outline-none transition focus:border-green-secondary sm:h-10 sm:px-3.5 sm:pr-10 sm:text-[13px] md:h-11 md:text-[14px]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray5">
                      <Calendar size={14} color="currentColor" />
                    </span>
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
              <div className="mt-3 rounded-2xl border border-border-input bg-white p-3 shadow-[0px_8px_24px_rgba(15,61,46,0.08)] sm:p-4">
                <SelectDropdown
                  value={formData.calendarYear}
                  onChange={(value) => updateField("calendarYear", value)}
                  options={yearOptions}
                  className="mb-3"
                  buttonClassName="h-9 rounded-lg text-[12px] sm:h-10 sm:text-[13px]"
                />
                <div className="mb-3 flex items-center justify-between text-[11px] font-medium text-gray2 sm:text-[12px] md:text-[13px]">
                  <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border-input text-gray5 sm:h-7 sm:w-7">‹</button>
                  <span>November 2024</span>
                  <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border-input text-gray5 sm:h-7 sm:w-7">›</button>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] text-gray5 sm:gap-2 sm:text-[10px] md:text-[11px]">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map((day) => <span key={day}>{day}</span>)}
                  {days.map((day, index) => (
                    <span
                      key={`${day ?? 'empty'}-${index}`}
                      className={`flex h-6 items-center justify-center rounded-lg text-[10px] sm:h-7 sm:text-[11px] md:h-8 md:text-[12px] ${day === 7 ? "bg-[#2F2F2F] text-white" : day ? "text-gray2" : "text-transparent"}`}
                    >
                      {day ?? "."}
                    </span>
                  ))}
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;
