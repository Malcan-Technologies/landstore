"use client";

import { memo, useCallback, useState } from "react";
import Button from "@/components/common/Button";
import PillCheckbox from "@/components/common/PillCheckbox";
import CircleRadioGroup from "@/components/common/CircleRadioGroup";
import RangeSlider from "@/components/common/RangeSlider";
import SelectDropdown from "@/components/common/SelectDropdown";
import ThreeBars from "@/components/svg/ThreeBars";
import List from "@/components/svg/List";
import Note from "@/components/svg/Note";
import DualNote from "@/components/svg/DualNote";
import Funnel from "@/components/svg/Funnel";
import Map from "@/components/svg/Map";

const dealTypeOptions = ["Buy", "JV", "Financing"];
const categoryOptions = ["Industrial", "Agriculture", "Commercial", "Residential"];
const terrainOptions = ["Flat", "Hilly", "Mixed"];
const utilizationOptions = ["Vacant", "Plantation", "Rented", "Occupied"];
const negeriOptions = [
  { value: "selangor", label: "Selangor" },
  { value: "kualalumpur", label: "Kuala Lumpur" },
  { value: "johor", label: "Johor" },
  { value: "penang", label: "Penang" },
];
const tanahOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "both", label: "Both" },
];

const summaryStats = [
  { label: "Listings", value: 5, icon: Note, key: "listings" },
  { label: "Shortlists", value: 15, icon: Note, key: "shortlists" },
  { label: "Deals", value: 2, icon: List, key: "deals" },
];

const viewModeOptions = [
  { key: "list", icons: [ThreeBars, Map] },
  { key: "map", icons: [Map] },
];

const toggleValue = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

const ViewToggle = memo(({ options, activeKey, onChange }) => (
  <div className="inline-flex items-center gap-1 rounded-lg border border-[#E4E9F0] bg-[#F5F7F5] p-0.5">
    {options.map(({ key, icons }) => {
      const active = activeKey === key;
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={active}
          className={`flex h-8 w-12 items-center justify-center rounded-md transition ${
            active ? "text-green-logo bg-white" : "text-[#7B8A99] bg-[#F5F7F5]"
          }`}
          aria-label={`${key} view`}
        >
          <span className="flex items-center gap-1.5">
            {icons.map((IconComp, iconIndex) => (
              <IconComp
                key={`${key}-icon-${iconIndex}`}
                size={16}
                color={active ? "var(--color-green-logo)" : "#7B8A99"}
                aria-hidden
              />
            ))}
          </span>
        </button>
      );
    })}
  </div>
));

const SummaryList = memo(({ summary, activeKey, onSelect }) => (
  <div className="space-y-1">
    {summary.map(({ label, value, icon: Icon, key }) => {
      const active = activeKey === key;
      const iconColor = active ? "#0F8D62" : "#9AA6B5";
      const inactiveColor = "text-[var(--color-gray1)]";
      const labelColor = active ? "text-[#0F8D62]" : inactiveColor;
      return (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(key)}
          className={`flex w-full items-center justify-between rounded-2xl py-2 text-left text-[14px] font-medium transition ${
            active ? "text-green-secondary" : inactiveColor
          }`}
        >
          <span className={`flex items-center gap-3 ${labelColor}`}>
            <Icon size={14} color={iconColor} aria-hidden />
            {label}
          </span>
          <span className={active ? "text-[#0F8D62]" : "text-[#5F6C7B]"}>({value})</span>
        </button>
      );
    })}
  </div>
));

const CheckboxSection = memo(({ label, options, selected, onToggle }) => (
  <div className="space-y-3">
    <p className="text-[13px] font-medium text-[#4A4A4A]">{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <PillCheckbox
          key={option}
          label={option}
          checked={selected.includes(option)}
          onChange={() => onToggle(option)}
        />
      ))}
    </div>
  </div>
));

const FilterPanel = () => {
  // console.log("FilterPanel rendered");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedState, setSelectedState] = useState(negeriOptions[0].value);
  const [selectedDealTypes, setSelectedDealTypes] = useState(["Buy", "JV"]);
  const [selectedCategories, setSelectedCategories] = useState(["Industrial", "Agriculture"]);
  const [selectedTerrain, setSelectedTerrain] = useState(["Flat", "Hilly"]);
  const [selectedUtilization, setSelectedUtilization] = useState(["Vacant", "Plantation"]);
  const [tanahRizab, setTanahRizab] = useState("yes");
  const [landArea, setLandArea] = useState([25, 75]);
  const [pricePerSqft, setPricePerSqft] = useState("");
  const [titleType, setTitleType] = useState("");
  const [viewMode, setViewMode] = useState(viewModeOptions[0].key);
  const [activeSummary, setActiveSummary] = useState(summaryStats[0].key);

  const handleLocationChange = (event) => setLocationSearch(event.target.value);
  const handleStateChange = useCallback((value) => setSelectedState(value), []);
  const handleDealTypeToggle = useCallback(
    (value) => setSelectedDealTypes((prev) => toggleValue(prev, value)),
    []
  );
  const handleCategoryToggle = useCallback(
    (value) => setSelectedCategories((prev) => toggleValue(prev, value)),
    []
  );
  const handleTerrainToggle = useCallback(
    (value) => setSelectedTerrain((prev) => toggleValue(prev, value)),
    []
  );
  const handleUtilizationToggle = useCallback(
    (value) => setSelectedUtilization((prev) => toggleValue(prev, value)),
    []
  );
  const handleTanahChange = useCallback((value) => setTanahRizab(value), []);
  const handleRangeChange = useCallback((range) => setLandArea(range), []);
  const handlePriceChange = useCallback((event) => setPricePerSqft(event.target.value), []);
  const handleTitleChange = useCallback((event) => setTitleType(event.target.value), []);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <aside className="w-full max-w-92.5 rounded-xl border border-[#E6EBF2] bg-white p-5 shadow-[0_20px_40px_rgba(15,61,46,0.05)]">
      <div className="space-y-5">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="flex items-center gap-2 text-[16px] font-semibold text-gray2">
              <DualNote size={16} color="#0F3D2E" aria-hidden /> Account summary
            </p>
            <ViewToggle options={viewModeOptions} activeKey={viewMode} onChange={setViewMode} />
          </div>
          <SummaryList summary={summaryStats} activeKey={activeSummary} onSelect={setActiveSummary} />
          <div className="my-5 border-t border-[#E7ECEF]" />
        </div>

        <div className="space-y-5">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-[#0B1220]">
            <Funnel size={16} color="#0F3D2E" /> Filters
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[13px] font-medium text-[#4A4A4A]">
                <Map size={14} color="#1E765F" /> Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Negeri or Daerah..."
                  value={locationSearch}
                  onChange={handleLocationChange}
                  autoComplete="off"
                  // inputMode="search"
                  className="h-10 w-full rounded-xl border border-[#D7DEE7] px-3.5 pl-4 text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#B3B3B3] focus:border-green-primary"
                />
              </div>
              <SelectDropdown
                value={selectedState}
                onChange={handleStateChange}
                options={negeriOptions}
                placeholder="Select Negeri"
              />
            </div>

            <CheckboxSection
              label="Deal type"
              options={dealTypeOptions}
              selected={selectedDealTypes}
              onToggle={handleDealTypeToggle}
            />

            <CheckboxSection
              label="Category"
              options={categoryOptions}
              selected={selectedCategories}
              onToggle={handleCategoryToggle}
            />

            <CheckboxSection
              label="Terrain"
              options={terrainOptions}
              selected={selectedTerrain}
              onToggle={handleTerrainToggle}
            />

            <CheckboxSection
              label="Current utilization"
              options={utilizationOptions}
              selected={selectedUtilization}
              onToggle={handleUtilizationToggle}
            />

            <div className="space-y-3">
              <p className="text-[13px] font-medium text-[#4A4A4A]">Tanah Rizab Melayu</p>
              <CircleRadioGroup value={tanahRizab} onChange={handleTanahChange} options={tanahOptions} />
            </div>

            {/* <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px] font-medium text-[#4A4A4A]">
                <span>Land area</span>
                <span className="rounded-xl border border-[#E0E7EF] px-2 py-1 text-[12px] text-[#4A4A4A]">
                  Acres
                </span>
              </div>
              <RangeSlider value={landArea} onChange={handleRangeChange} min={0} max={100} />
            </div> */}

            <div className="space-y-3">
              <label className="text-[13px] font-medium text-[#4A4A4A]">Price per sqft (RM)</label>
              <input
                type="number"
                placeholder="e.g. 4500"
                value={pricePerSqft}
                onChange={handlePriceChange}
                className="h-10 w-full rounded-xl border border-[#D7DEE7] px-3.5 text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#B3B3B3] focus:border-green-primary"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[13px] font-medium text-[#4A4A4A]">Title type</label>
              <input
                type="text"
                placeholder="Enter title"
                value={titleType}
                onChange={handleTitleChange}
                className="h-10 w-full rounded-xl border border-[#D7DEE7] px-3.5 text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#B3B3B3] focus:border-green-primary"
              />
            </div>

            <Button
              type="submit"
              className="mt-2 w-full justify-center rounded-xl text-[14px] font-semibold"
            >
              Apply filters
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
};

export default FilterPanel;
