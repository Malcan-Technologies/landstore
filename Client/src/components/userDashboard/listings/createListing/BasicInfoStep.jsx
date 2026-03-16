import CircleRadioGroup from "@/components/common/CircleRadioGroup";
import PillCheckbox from "@/components/common/PillCheckbox";
import SelectDropdown from "@/components/common/SelectDropdown";
import Camera from "@/components/svg/Camera";
import DangerSheild from "@/components/svg/DangerSheild";
import Upload from "@/components/svg/Upload";

const dealTypeOptions = ["Buy", "JV", "Financing"];
const terrainOptions = ["Flat", "Hilly", "Mixed"];
const featureOptions = ["Road Access", "Water", "Electricity"];
const utilizationOptions = [
  { value: "vacant", label: "Vacant" },
  { value: "rented", label: "Rented" },
  { value: "owner-used", label: "Owner used" },
];
const categoryOptions = [
  { value: "agriculture", label: "Agriculture" },
  { value: "industrial", label: "Industrial" },
  { value: "commercial", label: "Commercial" },
];
const priceOptions = [
  { value: "4500", label: "4,500" },
  { value: "6800", label: "6,800" },
  { value: "9500", label: "9,500" },
];
const ownershipOptions = [
  { value: "owned", label: "Land owned by me / my organisation" },
  { value: "agent", label: "I am listing on behalf of owner" },
];
const areaUnitOptions = [
  { value: "acres", label: "Acres" },
  { value: "sqft", label: "sqft" },
];

const chipClassName = "border-green-secondary/30 bg-activebg text-green-secondary";

const BasicInfoStep = ({ formData, updateField, toggleArrayValue }) => {
  return (
    <div className="space-y-7">
      <div>
        <div className="mb-3 flex items-center gap-2 text-[14px] font-medium text-gray2">
          <Camera size={18} color="var(--color-gray2)" />
          Photo upload
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <button
            type="button"
            className="flex h-[124px] flex-col items-center justify-center rounded-2xl border border-dashed border-border-card bg-white text-center transition hover:border-green-secondary/60"
          >
            <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-input bg-white text-gray7">
              <Upload size={18} color="var(--color-gray7)" />
            </span>
            <span className="text-[13px] font-medium text-gray2">Add photo <span className="text-gray5">(max. 5MB)</span></span>
          </button>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[124px] rounded-2xl bg-background-primary" />
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <p className="mb-3 text-[13px] font-medium text-gray2">Deal Types</p>
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
          <p className="mb-3 text-[13px] font-medium text-gray2">Terrain Chips</p>
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
          <p className="mb-3 text-[13px] font-medium text-gray2">Feature Tags</p>
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

      <div className="grid gap-5 md:grid-cols-2">
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

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-gray2">Land Area</label>
          <div className="flex gap-2">
            <input
              value={formData.landArea}
              onChange={(event) => updateField("landArea", event.target.value)}
              placeholder="Value"
              className="h-11 w-full rounded-xl border border-border-input bg-white px-3.5 text-[14px] text-gray2 outline-none transition focus:border-green-secondary"
            />
            <SelectDropdown
              value={formData.areaUnit}
              onChange={(value) => updateField("areaUnit", value)}
              options={areaUnitOptions}
              placeholder="Unit"
              className="w-[130px]"
              buttonClassName="h-11"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-[13px] font-medium text-gray2">Price per sqft (RM)</label>
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-medium text-gray7">Tanah rizab melayu</span>
              <CircleRadioGroup
                value={formData.rizabMalayu}
                onChange={(value) => updateField("rizabMalayu", value)}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
                className="gap-3"
                optionClassName="text-[13px]"
              />
            </div>
          </div>
          <SelectDropdown
            value={formData.pricePerSqft}
            onChange={(value) => updateField("pricePerSqft", value)}
            options={priceOptions}
            placeholder="e.g. 4500"
            buttonClassName="h-11"
          />
          <p className="mt-2 text-[12px] italic text-gray5">Estimated valuation: 1.2M</p>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[13px] font-medium text-gray2">Public Description</label>
        <textarea
          value={formData.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Enter description here..."
          className="min-h-[150px] w-full rounded-2xl border border-border-input bg-white px-3.5 py-3 text-[14px] text-gray2 outline-none transition focus:border-green-secondary"
        />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-[#F6D78B] bg-[#FFF8E8] px-3 py-3 text-[12px] font-medium text-[#D79A00]">
        <DangerSheild size={16} color="#D79A00" />
        Do not include lot number, owner name, contact, signboards
      </div>
    </div>
  );
};

export default BasicInfoStep;
