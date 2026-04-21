"use client";

import { memo, useCallback, useId, useMemo, useState } from "react";
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

const defaultDealTypeOptions = [
  { value: "buy", label: "Buy" },
  { value: "jv", label: "JV" },
  { value: "financing", label: "Financing" },
];
const defaultCategoryOptions = [
  { value: "industrial", label: "Industrial" },
  { value: "agriculture", label: "Agriculture" },
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
];
const defaultTerrainOptions = [
  { value: "flat", label: "Flat" },
  { value: "hilly", label: "Hilly" },
  { value: "mix", label: "Mixed" },
];
const defaultUtilizationOptions = [
  { value: "vacant", label: "Vacant" },
  { value: "plantation", label: "Plantation" },
  { value: "rented", label: "Rented" },
  { value: "occupied", label: "Occupied" },
];
const defaultStateOptions = [
  { value: "Selangor", label: "Selangor" },
  { value: "Kuala Lumpur", label: "Kuala Lumpur" },
  { value: "Johor", label: "Johor" },
  { value: "Penang", label: "Penang" },
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

const defaultFilterValues = {
  locationSearch: "",
  selectedState: "",
  selectedDealTypes: [],
  selectedCategories: [],
  selectedTerrain: [],
  selectedUtilization: [],
  tanahRizab: "both",
  landArea: [0, 100],
  landAreaUnit: landAreaUnitOptions[0].value,
  pricePerSqft: "",
  titleType: "",
  myListings: false,
  myShortlistings: false,
  myEnquiries: false,
};

const normalizeOption = (option) => {
  if (!option) {
    return null;
  }

  if (typeof option === "string") {
    return { value: option, label: option };
  }

  const value = option.value ?? option.id ?? option.key;
  const label = option.label ?? option.name ?? option.title ?? value;

  if (value === undefined || value === null || label === undefined || label === null) {
    return null;
  }

  return { value: String(value), label: String(label) };
};

const normalizeOptionList = (options, fallbackOptions = []) => {
  const source = Array.isArray(options) && options.length > 0 ? options : fallbackOptions;
  return source.map(normalizeOption).filter(Boolean);
};

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

const SummaryList = memo(({ summary, activeKeys, onSelect }) => (
  <div className="space-y-1">
    {summary.map(({ label, value, icon: Icon, key, filterKey }) => {
      const active = activeKeys.has(filterKey);
      const iconColor = active ? "var(--color-green-secondary)" : "var(--color-gray5)";
      const inactiveColor = "text-gray1";
      const labelColor = active ? "text-green-secondary" : inactiveColor;
      return (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(filterKey)}
          className={`flex w-full items-center justify-start gap-1 rounded-2xl py-2 text-left text-[14px] font-medium transition ${
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
          key={option.value}
          label={option.label}
          checked={selected.includes(option.value)}
          onChange={() => onToggle(option.value)}
        />
      ))}
    </div>
  </div>
));

const FilterPanel = ({
  showFilters = true,
  showAccountSummary = true,
  variant = "sidebar",
  collapseBehavior = "internal",
  onToggleRequest,
  filterOptions,
  locationSuggestions,
  filterValues,
  onFilterValuesChange,
  onApplyFilters,
  onSummarySelect,
  isApplyLoading = false,
  userStatistics = null,
}) => {
  const [internalFilterValues, setInternalFilterValues] = useState(defaultFilterValues);
  const [viewMode, setViewMode] = useState(viewModeOptions[0].key);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const isModalVariant = variant === "modal";
  const usesExternalCollapse = collapseBehavior === "external";
  const isFilterControlled = typeof onFilterValuesChange === "function";

  const effectiveFilterValues = useMemo(
    () => ({
      ...defaultFilterValues,
      ...(isFilterControlled ? filterValues : internalFilterValues),
    }),
    [filterValues, internalFilterValues, isFilterControlled]
  );

  const resolvedDealTypeOptions = useMemo(
    () => normalizeOptionList(filterOptions?.dealTypes, defaultDealTypeOptions),
    [filterOptions]
  );
  const resolvedCategoryOptions = useMemo(
    () => normalizeOptionList(filterOptions?.categories, defaultCategoryOptions),
    [filterOptions]
  );
  const resolvedTerrainOptions = useMemo(
    () => normalizeOptionList(filterOptions?.terrain, defaultTerrainOptions),
    [filterOptions]
  );
  const resolvedUtilizationOptions = useMemo(
    () => normalizeOptionList(filterOptions?.utilizations, defaultUtilizationOptions),
    [filterOptions]
  );
  const resolvedStateOptions = useMemo(
    () => normalizeOptionList(filterOptions?.states, defaultStateOptions),
    [filterOptions]
  );
  const resolvedLocationSuggestionOptions = useMemo(() => {
    const normalized = normalizeOptionList(locationSuggestions, resolvedStateOptions);
    const seen = new Set();

    return normalized.filter((item) => {
      const key = String(item?.label || item?.value || "").trim().toLowerCase();
      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [locationSuggestions, resolvedStateOptions]);
  const resolvedTitleTypeOptions = useMemo(
    () => normalizeOptionList(filterOptions?.titleTypes),
    [filterOptions]
  );

  const summaryStats = useMemo(() => [
    { label: "Listings", value: userStatistics?.totalListings ?? 0, icon: Note, key: "listings", filterKey: "myListings" },
    { label: "Shortlists", value: userStatistics?.totalShortlisted ?? 0, icon: Note, key: "shortlists", filterKey: "myShortlistings" },
    { label: "Deals", value: userStatistics?.totalEnquiries ?? 0, icon: List, key: "deals", filterKey: "myEnquiries" },
  ], [userStatistics]);

  const locationSuggestionListId = useId();

  const currentLandArea = Array.isArray(effectiveFilterValues.landArea) && effectiveFilterValues.landArea.length === 2
    ? effectiveFilterValues.landArea
    : defaultFilterValues.landArea;

  const syncFilterValues = useCallback(
    (patch) => {
      const nextValues = {
        ...effectiveFilterValues,
        ...patch,
      };

      if (isFilterControlled) {
        onFilterValuesChange(nextValues);
        return;
      }

      setInternalFilterValues(nextValues);
    },
    [effectiveFilterValues, isFilterControlled, onFilterValuesChange]
  );

  const handleLocationChange = useCallback((event) => {
    const nextLocationSearch = event.target.value;
    const normalizedQuery = nextLocationSearch.trim().toLowerCase();

    if (!normalizedQuery) {
      syncFilterValues({ locationSearch: "", selectedState: "" });
      return;
    }

    const matchedState = resolvedStateOptions.find((stateOption) => {
      const normalizedLabel = String(stateOption.label || "").trim().toLowerCase();
      const normalizedValue = String(stateOption.value || "").trim().toLowerCase();
      return normalizedLabel === normalizedQuery || normalizedValue === normalizedQuery;
    });

    if (matchedState) {
      syncFilterValues({
        locationSearch: matchedState.label,
        selectedState: matchedState.value,
      });
      return;
    }

    syncFilterValues({ locationSearch: nextLocationSearch });
  }, [resolvedStateOptions, syncFilterValues]);

  const handleStateChange = useCallback((value) => {
    const selectedOption = resolvedStateOptions.find((stateOption) => stateOption.value === value);

    syncFilterValues({
      selectedState: value,
      locationSearch: selectedOption?.label || "",
    });
  }, [resolvedStateOptions, syncFilterValues]);
  const handleDealTypeToggle = useCallback(
    (value) => syncFilterValues({ selectedDealTypes: toggleValue(effectiveFilterValues.selectedDealTypes, value) }),
    [effectiveFilterValues.selectedDealTypes, syncFilterValues]
  );
  const handleCategoryToggle = useCallback(
    (value) => syncFilterValues({ selectedCategories: toggleValue(effectiveFilterValues.selectedCategories, value) }),
    [effectiveFilterValues.selectedCategories, syncFilterValues]
  );
  const handleTerrainToggle = useCallback(
    (value) => syncFilterValues({ selectedTerrain: toggleValue(effectiveFilterValues.selectedTerrain, value) }),
    [effectiveFilterValues.selectedTerrain, syncFilterValues]
  );
  const handleUtilizationToggle = useCallback(
    (value) => syncFilterValues({ selectedUtilization: toggleValue(effectiveFilterValues.selectedUtilization, value) }),
    [effectiveFilterValues.selectedUtilization, syncFilterValues]
  );
  const handleTanahChange = useCallback((value) => syncFilterValues({ tanahRizab: value }), [syncFilterValues]);
  const handleRangeChange = useCallback((range) => syncFilterValues({ landArea: range }), [syncFilterValues]);
  const handleLandAreaUnitChange = useCallback((value) => syncFilterValues({ landAreaUnit: value }), [syncFilterValues]);
  const handlePriceChange = useCallback((event) => syncFilterValues({ pricePerSqft: event.target.value }), [syncFilterValues]);
  const handleTitleTypeChange = useCallback((value) => syncFilterValues({ titleType: value }), [syncFilterValues]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onApplyFilters?.(effectiveFilterValues);
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
      className={`relative w-full${!isModalVariant && !usesExternalCollapse && isPanelCollapsed ? "max-w-fit bg-transparent p-0 shadow-none" : "max-w-84 rounded-xl bg-white p-5 px-3 shadow-[0_20px_40px_rgba(15,61,46,0.05)]"} ${isModalVariant || usesExternalCollapse ? "flex h-full flex-col overflow-hidden" : ""}`}
    >
      <div className={`${!isModalVariant && !usesExternalCollapse && isPanelCollapsed ? "absolute -right-20 top-0 z-10" : showAccountSummary ? "mb-4 flex items-center justify-between gap-2" : "mb-2"}`}>
        {showAccountSummary && !(!isModalVariant && !usesExternalCollapse && isPanelCollapsed) ? (
          <p className="flex items-center gap-2 text-[16px] font-semibold text-gray2">
            <DualNote size={16} color="var(--color-green-logo)" aria-hidden /> Account summary
          </p>
        ) : null}
        {!isModalVariant && showAccountSummary ? <ViewToggle options={viewModeOptions} activeKey={viewMode} onChange={handleViewModeChange} /> : null}
      </div>

      {isModalVariant || usesExternalCollapse || !isPanelCollapsed ? (
        <div className={`space-y-5 ${isModalVariant || usesExternalCollapse ? "min-h-0 flex-1 overflow-y-auto no-scrollbar px-2" : ""}`}>
          {showAccountSummary ? (
            <div>
              <SummaryList
              summary={summaryStats}
              activeKeys={new Set(summaryStats.filter((s) => effectiveFilterValues[s.filterKey]).map((s) => s.filterKey))}
              onSelect={(filterKey) => {
                const isCurrentlyActive = effectiveFilterValues[filterKey];
                const patch = {
                  myListings: false,
                  myShortlistings: false,
                  myEnquiries: false,
                  [filterKey]: !isCurrentlyActive,
                };
                const nextValues = { ...effectiveFilterValues, ...patch };
                if (isFilterControlled) {
                  onFilterValuesChange(nextValues);
                } else {
                  setInternalFilterValues(nextValues);
                }
                onSummarySelect?.(nextValues);
              }}
            />
              <div className="my-5 border-t border-border-input" />
            </div>
          ) : null}

          {showFilters ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-[15px] font-semibold text-gray2">
                  <Funnel size={16} color="var(--color-green-logo)" /> Filters
                </p>
                {!isModalVariant && !showAccountSummary ? (
                  <ViewToggle options={viewModeOptions} activeKey={viewMode} onChange={handleViewModeChange} />
                ) : null}
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[13px] font-medium text-gray7">
                    <Map size={14} color="var(--color-green-secondary)" /> Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Negeri or Daerah..."
                      value={effectiveFilterValues.locationSearch}
                      onChange={handleLocationChange}
                      list={locationSuggestionListId}
                      autoComplete="off"
                      className="h-10 w-full rounded-xl border border-border-input px-3.5 pl-4 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
                    />
                    {resolvedLocationSuggestionOptions.length > 0 ? (
                      <datalist id={locationSuggestionListId}>
                        {resolvedLocationSuggestionOptions.map((option) => (
                          <option key={`${option.value}-${option.label}`} value={option.label} />
                        ))}
                      </datalist>
                    ) : null}
                  </div>
                  <SelectDropdown
                    value={effectiveFilterValues.selectedState}
                    onChange={handleStateChange}
                    options={resolvedStateOptions}
                    placeholder="Select Negeri"
                  />
                </div>

                <CheckboxSection
                  label="Deal type"
                  options={resolvedDealTypeOptions}
                  selected={effectiveFilterValues.selectedDealTypes}
                  onToggle={handleDealTypeToggle}
                />

                <CheckboxSection
                  label="Category"
                  options={resolvedCategoryOptions}
                  selected={effectiveFilterValues.selectedCategories}
                  onToggle={handleCategoryToggle}
                />

                <CheckboxSection
                  label="Terrain"
                  options={resolvedTerrainOptions}
                  selected={effectiveFilterValues.selectedTerrain}
                  onToggle={handleTerrainToggle}
                />

                <CheckboxSection
                  label="Current utilization"
                  options={resolvedUtilizationOptions}
                  selected={effectiveFilterValues.selectedUtilization}
                  onToggle={handleUtilizationToggle}
                />

                <div className="space-y-3">
                  <p className="text-[13px] font-medium text-gray7">Tanah Rizab Melayu</p>
                  <CircleRadioGroup value={effectiveFilterValues.tanahRizab} onChange={handleTanahChange} options={tanahOptions} />
                </div>

                <div className="space-y-0">
                  <label className="block text-[13px] font-medium text-gray7">Land area</label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="relative flex-1 pb-7">
                      <RangeSlider
                        value={currentLandArea}
                        onChange={handleRangeChange}
                        min={0}
                        max={100}
                        step={1}
                        className="max-w-none"
                        showValues={false}
                      />
                      <span
                        className="absolute top-full -mt-4  -translate-x-1/2 text-[14px] font-medium text-gray2"
                        style={{ left: getThumbAlignedLeft(currentLandArea[0], 0, 100) }}
                      >
                        {currentLandArea[0]}
                      </span>
                      <span
                        className="absolute top-full -mt-4  -translate-x-1/2 text-[14px] font-medium text-gray2"
                        style={{ left: getThumbAlignedLeft(currentLandArea[1], 0, 100) }}
                      >
                        {currentLandArea[1]}
                      </span>
                    </div>
                    <SelectDropdown
                      value={effectiveFilterValues.landAreaUnit}
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
                    value={effectiveFilterValues.pricePerSqft}
                    onChange={handlePriceChange}
                    className="h-10 w-full rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[13px] font-medium text-gray7">Title type</label>
                  <SelectDropdown
                    value={effectiveFilterValues.titleType}
                    onChange={handleTitleTypeChange}
                    options={resolvedTitleTypeOptions}
                    placeholder="Select title type"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isApplyLoading}
                  className="mt-2 w-full justify-center rounded-xl text-[14px] font-semibold"
                >
                  {isApplyLoading ? "Applying..." : "Apply filters"}
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
