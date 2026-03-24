import CircleRadioGroup from "@/components/common/CircleRadioGroup";
import LeaseholdCalendarInput from "@/components/userDashboard/listings/createListing/LeaseholdCalendarInput";
import SelectDropdown from "@/components/common/SelectDropdown";
import MapView from "@/components/userDashboard/explore/MapView";

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
        <div className="flex flex-col sm:flex-row sm:gap-3 gap-1">
          {formData.titleType === "leasehold" && (
            <>
              <div className="mt-3 flex-1">
                <LeaseholdCalendarInput
                  label="Leasehold start year"
                  value={formData.leaseStartDate}
                  calendarYear={formData.calendarYear}
                  onChange={(value) => updateField("leaseStartDate", value)}
                  onCalendarYearChange={(value) => updateField("calendarYear", value)}
                />
              </div>
              <div className="mt-3 flex-1">
                <SelectDropdown
                  label="Leasehold Period"
                  value={formData.leasePeriod}
                  onChange={(value) => updateField("leasePeriod", value)}
                  options={leaseOptions}
                  placeholder="Select period"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationStep;
