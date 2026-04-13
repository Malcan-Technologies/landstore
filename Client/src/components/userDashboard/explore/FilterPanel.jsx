"use client";

import { memo, useCallback, useState } from "react";
import Button from "@/components/common/Button";
import PillCheckbox from "@/components/common/PillCheckbox";
import CircleRadioGroup from "@/components/common/CircleRadioGroup";
import RangeSlider from "@/components/common/RangeSlider";
import SelectDropdown from "@/components/common/SelectDropdown";
import FolderSection from "@/components/userDashboard/explore/FolderSection";
import ThreeBars from "@/components/svg/ThreeBars";
import List from "@/components/svg/List";
import Note from "@/components/svg/Note";
import DualNote from "@/components/svg/DualNote";
import Folder from "@/components/svg/Folder";
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
const landAreaUnitOptions = [
  { value: "acres", label: "Acres" },
  { value: "sqft", label: "Square feet" },
  { value: "hectares", label: "Hectares" },
  { value: "sqm", label: "Square meters" },
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

const getRangePercent = (value, min, max) => {
  if (max <= min) {
    return 0;
  }

  return ((value - min) / (max - min)) * 100;
};

const getThumbAlignedLeft = (value, min, max, thumbSize = 20) => {
  const percent = getRangePercent(value, min, max);
  const offset = (0.5 - percent / 100) * thumbSize;

  return `calc(${percent}% + ${offset}px)`;
};

const ViewToggle = memo(({ options, activeKey, onChange }) => (
  <div className="inline-flex items-center gap-1 rounded-lg  bg-background-primary p-1">
    {options.map(({ key, icons }) => {
      const active = activeKey === key;
      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={active}
          className={`flex h-8 w-12 items-center justify-center rounded-md transition ${active ? "bg-white text-green-logo" : "bg-background-primary text-gray5"}`}
          aria-label={`${key} view`}
        >
          <span className="flex items-center gap-1.5">
            {icons.map((IconComp, iconIndex) => (
              <IconComp key={`${key}-icon-${iconIndex}`} size={16} color={active ? "var(--color-green-logo)" : "var(--color-gray5)"} aria-hidden />
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
      const iconColor = active ? "var(--color-green-secondary)" : "var(--color-gray5)";
      const inactiveColor = "text-gray1";
      const labelColor = active ? "text-green-secondary" : inactiveColor;
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
          <span className={active ? "text-green-secondary" : "text-gray5"}>({value})</span>
        </button>
      );
    })}
  </div>
));

const CheckboxSection = memo(({ label, options, selected, onToggle }) => (
  <div className="space-y-3">
    <p className="text-[13px] font-medium text-gray7">{label}</p>
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

const FilterPanel = ({
  showFilters = true,
  variant = "sidebar",
  collapseBehavior = "internal",
  onToggleRequest,
  folders = [],
  foldersTitle = "Folders",
  activeFolderId,
  onFolderSelect,
  createFolderLabel = "Create new folder",
  onCreateFolder,
  activeFolderMenuId,
  onFolderMenuToggle,
  onRenameFolder,
  renamingFolderId,
  onRenameFolderSave,
  onDeleteFolder,
}) => {
  // console.log("FilterPanel rendered");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedState, setSelectedState] = useState(negeriOptions[0].value);
  const [selectedDealTypes, setSelectedDealTypes] = useState(["Buy", "JV"]);
  const [selectedCategories, setSelectedCategories] = useState(["Industrial", "Agriculture"]);
  const [selectedTerrain, setSelectedTerrain] = useState(["Flat", "Hilly"]);
  const [selectedUtilization, setSelectedUtilization] = useState(["Vacant", "Plantation"]);
  const [tanahRizab, setTanahRizab] = useState("yes");
  const [landArea, setLandArea] = useState([25, 75]);
  const [landAreaUnit, setLandAreaUnit] = useState(landAreaUnitOptions[0].value);
  const [pricePerSqft, setPricePerSqft] = useState("");
  const [titleType, setTitleType] = useState("");
  const [viewMode, setViewMode] = useState(viewModeOptions[0].key);
  const [activeSummary, setActiveSummary] = useState(summaryStats[0].key);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const isModalVariant = variant === "modal";
  const usesExternalCollapse = collapseBehavior === "external";

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
  const handleLandAreaUnitChange = useCallback((value) => setLandAreaUnit(value), []);
  const handlePriceChange = useCallback((event) => setPricePerSqft(event.target.value), []);
  const handleTitleChange = useCallback((event) => setTitleType(event.target.value), []);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleViewModeChange = useCallback((nextViewMode) => {
    if (isModalVariant) {
      return;
    }
    setViewMode(nextViewMode);
    if (usesExternalCollapse) {
      onToggleRequest?.(nextViewMode);
      return;
    }
    setIsPanelCollapsed((prev) => !prev);
  }, [isModalVariant, onToggleRequest, usesExternalCollapse]);

  return (
    <aside
      className={`relative w-full${!isModalVariant && !usesExternalCollapse && isPanelCollapsed ? "max-w-fit bg-transparent p-0 shadow-none" : "max-w-84 rounded-xl bg-white p-5 shadow-[0_20px_40px_rgba(15,61,46,0.05)]"} ${isModalVariant || usesExternalCollapse ? "flex h-full flex-col overflow-hidden" : ""}`}
    >
      <div className={`${!isModalVariant && !usesExternalCollapse && isPanelCollapsed ? "absolute -right-20 top-0 z-10" : "mb-4 flex items-center justify-between gap-2"}`}>
        {!(!isModalVariant && !usesExternalCollapse && isPanelCollapsed) ? (
          <p className="flex items-center gap-2 text-[16px] font-semibold text-gray2">
            <DualNote size={16} color="var(--color-green-logo)" aria-hidden /> Account summary
          </p>
        ) : null}
        {!isModalVariant ? <ViewToggle options={viewModeOptions} activeKey={viewMode} onChange={handleViewModeChange} /> : null}
      </div>

      {isModalVariant || usesExternalCollapse || !isPanelCollapsed ? (
        <div className={`space-y-5 ${isModalVariant || usesExternalCollapse ? "min-h-0 flex-1 overflow-y-auto no-scrollbar pr-1" : ""}`}>
          <div>
            <SummaryList summary={summaryStats} activeKey={activeSummary} onSelect={setActiveSummary} />
            <div className="my-5 border-t border-border-input" />
          </div>

          {folders.length ? (
            <div className="space-y-5">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-gray2">
                <Folder size={18} color="var(--color-gray2)" /> {foldersTitle}
              </p>
              <FolderSection
                folders={folders}
                activeFolderId={activeFolderId}
                onFolderSelect={onFolderSelect}
                createFolderLabel={createFolderLabel}
                onCreateFolder={onCreateFolder}
                activeFolderMenuId={activeFolderMenuId}
                onFolderMenuToggle={onFolderMenuToggle}
                onRenameFolder={onRenameFolder}
                renamingFolderId={renamingFolderId}
                onRenameFolderSave={onRenameFolderSave}
                onDeleteFolder={onDeleteFolder}
              />
            </div>
          ) : null}

          {showFilters ? (
            <div className="space-y-5">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-gray2">
                <Funnel size={16} color="var(--color-green-logo)" /> Filters
              </p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[13px] font-medium text-gray7">
                    <Map size={14} color="var(--color-green-secondary)" /> Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Negeri or Daerah..."
                      value={locationSearch}
                      onChange={handleLocationChange}
                      autoComplete="off"
                      className="h-10 w-full rounded-xl border border-border-input px-3.5 pl-4 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
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
                  <p className="text-[13px] font-medium text-gray7">Tanah Rizab Melayu</p>
                  <CircleRadioGroup value={tanahRizab} onChange={handleTanahChange} options={tanahOptions} />
                </div>

                <div className="space-y-0">
                  <label className="block text-[13px] font-medium text-gray7">Land area</label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="relative flex-1 pb-7">
                      <RangeSlider
                        value={landArea}
                        onChange={handleRangeChange}
                        min={0}
                        max={100}
                        step={1}
                        className="max-w-none"
                        showValues={false}
                      />
                      <span
                        className="absolute top-full -mt-4  -translate-x-1/2 text-[14px] font-medium text-gray2"
                        style={{ left: getThumbAlignedLeft(landArea[0], 0, 100) }}
                      >
                        {landArea[0]}
                      </span>
                      <span
                        className="absolute top-full -mt-4  -translate-x-1/2 text-[14px] font-medium text-gray2"
                        style={{ left: getThumbAlignedLeft(landArea[1], 0, 100) }}
                      >
                        {landArea[1]}
                      </span>
                    </div>
                    <SelectDropdown
                      value={landAreaUnit}
                      onChange={handleLandAreaUnitChange}
                      options={landAreaUnitOptions}
                      className="w-16 shrink-0 -mt-3"
                      buttonClassName="h-7 rounded-lg !px-2 !py-1 !text-[10px] -mt-3 !gap-0"
                      optionsClassName="right-0 !w-32 min-w-32"
                      optionClassName="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[13px] font-medium text-gray7">Price per sqft (RM)</label>
                  <input
                    type="number"
                    placeholder="e.g. 4500"
                    value={pricePerSqft}
                    onChange={handlePriceChange}
                    className="h-10 w-full rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[13px] font-medium text-gray7">Title type</label>
                  <input
                    type="text"
                    placeholder="Enter title"
                    value={titleType}
                    onChange={handleTitleChange}
                    className="h-10 w-full rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
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
          ) : null}
        </div>
      ) : null}
    </aside>
  );
};

export default FilterPanel;
