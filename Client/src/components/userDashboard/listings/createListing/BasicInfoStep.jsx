import { useEffect, useMemo, useRef } from "react";

import CircleRadioGroup from "@/components/common/CircleRadioGroup";
import PillCheckbox from "@/components/common/PillCheckbox";
import SelectDropdown from "@/components/common/SelectDropdown";
import Camera from "@/components/svg/Camera";
import DangerSheild from "@/components/svg/DangerSheild";
import Upload from "@/components/svg/Upload";

const dealTypeOptions = ["Buy", "JV", "Financing"];
const terrainOptions = ["Flat", "Hilly", "Mixed"];
const featureOptions = ["Road Access", "Water", "Electricity"];
const defaultUtilizationOptions = [
  { value: "vacant", label: "Vacant" },
  { value: "rented", label: "Rented" },
  { value: "owner-used", label: "Owner used" },
];
const defaultCategoryOptions = [
  { value: "agriculture", label: "Agriculture" },
  { value: "industrial", label: "Industrial" },
  { value: "commercial", label: "Commercial" },
];
const priceOptions = [
  { value: "4500", label: "4,500" },
  { value: "6800", label: "6,800" },
  { value: "9500", label: "9,500" },
];
const defaultOwnershipOptions = [
  { value: "owned", label: "Land owned by me / my organisation" },
  { value: "agent", label: "I am listing on behalf of owner" },
];
const areaUnitOptions = [
  { value: "acres", label: "Acres" },
  { value: "sqft", label: "sqft" },
];

const maxPhotos = 4;
const chipClassName = "border-green-secondary/30 bg-activebg text-green-secondary";

const BasicInfoStep = ({
  formData,
  updateField,
  toggleArrayValue,
  ownershipOptions = defaultOwnershipOptions,
  utilizationOptions = defaultUtilizationOptions,
  categoryOptions = defaultCategoryOptions,
}) => {
  const fileInputRef = useRef(null);
  const photos = useMemo(() => formData.photos ?? [], [formData.photos]);
  const previewUrls = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const photoSlots = useMemo(() => {
    return Array.from({ length: maxPhotos }, (_, index) => previewUrls[index] ?? null);
  }, [previewUrls]);

  const handlePhotoUpload = (event) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const nextPhotos = [...photos, ...selectedFiles].slice(0, maxPhotos);
    updateField("photos", nextPhotos);
    event.target.value = "";
  };

  const handleRemovePhoto = (indexToRemove) => {
    updateField(
      "photos",
      photos.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 md:space-y-7">
      <div>
        <div className="mb-2.5 flex items-center gap-2 text-[12px] font-medium text-gray2 sm:mb-3 sm:text-[13px] md:text-[14px]">
          <Camera size={16} color="var(--color-gray2)" />
          Photo upload
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5">
          {photoSlots.map((photoUrl, index) =>
            photoUrl ? (
              <div key={index} className="relative h-30 overflow-hidden rounded-md bg-background-primary sm:h-40 sm:rounded-lg md:h-44">
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute right-2 top-2 z-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-[16px] leading-none text-white transition hover:bg-black/80"
                  aria-label={`Remove uploaded photo ${index + 1}`}
                >
                  ×
                </button>
                <img src={photoUrl} alt={`Uploaded land ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ) : index === previewUrls.length && previewUrls.length < maxPhotos ? (
              <button
                key={index}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-30 flex-col items-center justify-center rounded-md border border-dashed border-border-card bg-white text-center transition hover:border-green-secondary/60 sm:h-40 sm:rounded-lg md:h-44"
              >
                <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border-input bg-white text-gray7 sm:mb-3 sm:h-9 sm:w-9 sm:rounded-md">
                  <Upload size={16} color="var(--color-gray7)" />
                </span>
                <span className="text-[10px] font-medium text-gray2 sm:text-[12px] md:text-[13px]">Add photo <span className="text-gray5">(max. 5MB)</span></span>
              </button>
            ) : (
              <div key={index} className="h-30 rounded-md bg-[#F1F1F1] sm:h-40 sm:rounded-lg md:h-44" />
            )
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
        <div>
          <p className="mb-2 text-[12px] font-medium text-gray2 sm:mb-3 sm:text-[13px]">Deal Types</p>
          <div className="flex flex-wrap gap-2">
            {dealTypeOptions.map((option) => (
              <PillCheckbox
                key={option}
                label={option}
                checked={formData.dealTypes.includes(option)}
                onChange={() => toggleArrayValue("dealTypes", option)}
                checkedClassName={chipClassName}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-medium text-gray2 sm:mb-3 sm:text-[13px]">Terrain Chips</p>
          <div className="flex flex-wrap gap-2">
            {terrainOptions.map((option) => (
              <PillCheckbox
                key={option}
                label={option}
                checked={formData.terrain.includes(option)}
                onChange={() => toggleArrayValue("terrain", option)}
                checkedClassName={chipClassName}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-medium text-gray2 sm:mb-3 sm:text-[13px]">Feature Tags</p>
          <div className="flex flex-wrap gap-2">
            {featureOptions.map((option) => (
              <PillCheckbox
                key={option}
                label={option}
                checked={formData.features.includes(option)}
                onChange={() => toggleArrayValue("features", option)}
                checkedClassName={chipClassName}
              />
            ))}
          </div>
        </div>
      </div>

      <SelectDropdown
        label="Ownership Relationship"
        value={formData.ownership}
        onChange={(value) => updateField("ownership", value)}
        options={ownershipOptions}
        placeholder="Select ownership relationship"
      />

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <SelectDropdown
          label="Current Utilization"
          value={formData.utilization}
          onChange={(value) => updateField("utilization", value)}
          options={utilizationOptions}
          placeholder="Select utilization"
        />
        <SelectDropdown
          label="Category"
          value={formData.category}
          onChange={(value) => updateField("category", value)}
          options={categoryOptions}
          placeholder="Select category"
        />
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[12px] font-medium text-gray2 sm:text-[13px]">Land Area</label>
          <div className="flex gap-2">
            <input
              value={formData.landArea}
              onChange={(event) => updateField("landArea", event.target.value)}
              placeholder="Value"
              className="h-9 w-full rounded-md border border-border-input bg-white px-3 text-[12px] text-gray2 outline-none transition focus:border-green-secondary sm:h-10 sm:px-3.5 sm:text-[13px] md:h-11 md:text-[14px]"
            />
            <SelectDropdown
              value={formData.areaUnit}
              onChange={(value) => updateField("areaUnit", value)}
              options={areaUnitOptions}
              placeholder="Unit"
              className="w-25 sm:w-28.75 md:w-32.5"
              buttonClassName="h-9 text-[12px] sm:h-10 sm:text-[13px] md:h-11"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <label className="block text-[12px] font-medium text-gray2 sm:text-[13px]">Price per sqft (RM)</label>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-[11px] font-medium text-gray7 sm:text-[12px]">Tanah rizab melayu</span>
              <CircleRadioGroup
                value={formData.rizabMalayu}
                onChange={(value) => updateField("rizabMalayu", value)}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                className="gap-2 sm:gap-3"
                optionClassName="text-[11px] sm:text-[12px] md:text-[13px]"
              />
            </div>
          </div>
          <SelectDropdown
            value={formData.pricePerSqft}
            onChange={(value) => updateField("pricePerSqft", value)}
            options={priceOptions}
            placeholder="e.g. 4500"
            buttonClassName="h-9 text-[12px] sm:h-10 sm:text-[13px] md:h-11"
          />
          <p className="mt-2 text-[11px] italic text-gray5 sm:text-[12px]">Estimated valuation: 1.2M</p>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-medium text-gray2 sm:text-[13px]">Public Description</label>
        <textarea
          value={formData.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Enter description here..."
          className="min-h-30 w-full rounded-lg border border-border-input bg-white px-3 py-2.5 text-[12px] text-gray2 outline-none transition focus:border-green-secondary sm:min-h-33.75 sm:px-3.5 sm:py-3 sm:text-[13px] md:min-h-37.5 md:text-[14px]"
        />
      </div>

      <div className="flex items-start gap-2 rounded-md border border-[#F6D78B] bg-[#FFF8E8] px-3 py-2.5 text-[10px] font-medium text-[#D79A00] sm:items-center sm:py-3 sm:text-[11px] md:text-[12px]">
        <DangerSheild size={14} color="#D79A00" />
        Do not include lot number, owner name, contact, signboards
      </div>
    </div>
  );
};

export default BasicInfoStep;
