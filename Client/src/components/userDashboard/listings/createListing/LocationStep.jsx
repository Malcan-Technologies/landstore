import CircleRadioGroup from "@/components/common/CircleRadioGroup";
import LeaseholdCalendarInput from "@/components/userDashboard/listings/createListing/LeaseholdCalendarInput";
import SelectDropdown from "@/components/common/SelectDropdown";
import MapView from "@/components/userDashboard/explore/MapView";
import { getFilePreviewUrl } from "@/utils/filePreview";

const toSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const negeriData = [
  {
    value: "johor",
    label: "Johor",
    center: { lat: 1.4927, lng: 103.7414 },
    daerah: [
      { value: "johor-bahru", label: "Johor Bahru", center: { lat: 1.4927, lng: 103.7414 } },
      { value: "pontian", label: "Pontian", center: { lat: 1.4866, lng: 103.3896 } },
      { value: "kota-tinggi", label: "Kota Tinggi", center: { lat: 1.7381, lng: 103.8999 } },
      { value: "kluang", label: "Kluang", center: { lat: 2.0305, lng: 103.3169 } },
      { value: "batu-pahat", label: "Batu Pahat", center: { lat: 1.8548, lng: 102.9325 } },
      { value: "muar", label: "Muar", center: { lat: 2.0442, lng: 102.5689 } },
      { value: "segamat", label: "Segamat", center: { lat: 2.5148, lng: 102.8158 } },
      { value: "mersing", label: "Mersing", center: { lat: 2.4312, lng: 103.8366 } },
      { value: "tangkak", label: "Tangkak", center: { lat: 2.267, lng: 102.5453 } },
      { value: "kulai", label: "Kulai", center: { lat: 1.6625, lng: 103.6032 } },
    ],
  },
  {
    value: "kedah",
    label: "Kedah",
    center: { lat: 6.1248, lng: 100.3678 },
    daerah: [
      { value: "kota-setar", label: "Kota Setar", center: { lat: 6.1248, lng: 100.3678 } },
      { value: "kubang-pasu", label: "Kubang Pasu", center: { lat: 6.4373, lng: 100.434 } },
      { value: "padang-terap", label: "Padang Terap", center: { lat: 6.2592, lng: 100.6142 } },
      { value: "langkawi", label: "Langkawi", center: { lat: 6.3297, lng: 99.8432 } },
      { value: "kedah-selatan", label: "Kedah Selatan", center: { lat: 5.3642, lng: 100.5618 } },
      { value: "yan", label: "Yan", center: { lat: 5.7944, lng: 100.3924 } },
      { value: "kuala-muda", label: "Kuala Muda", center: { lat: 5.647, lng: 100.4877 } },
      { value: "sik", label: "Sik", center: { lat: 5.8244, lng: 100.7337 } },
      { value: "baling", label: "Baling", center: { lat: 5.677, lng: 100.9176 } },
      { value: "bandar-baharu", label: "Bandar Baharu", center: { lat: 5.116, lng: 100.4944 } },
    ],
  },
  {
    value: "kelantan",
    label: "Kelantan",
    center: { lat: 6.1254, lng: 102.2381 },
    daerah: [
      { value: "kota-bharu", label: "Kota Bharu", center: { lat: 6.1254, lng: 102.2381 } },
      { value: "pasir-mas", label: "Pasir Mas", center: { lat: 6.0492, lng: 102.1392 } },
      { value: "tumpat", label: "Tumpat", center: { lat: 6.1988, lng: 102.1709 } },
      { value: "bachok", label: "Bachok", center: { lat: 6.0706, lng: 102.4 } },
      { value: "tanah-merah", label: "Tanah Merah", center: { lat: 5.8083, lng: 102.1466 } },
      { value: "pasir-puteh", label: "Pasir Puteh", center: { lat: 5.8444, lng: 102.3944 } },
      { value: "kuala-krai", label: "Kuala Krai", center: { lat: 5.5308, lng: 102.1997 } },
      { value: "machang", label: "Machang", center: { lat: 5.7579, lng: 102.2142 } },
      { value: "jeli", label: "Jeli", center: { lat: 5.733, lng: 101.8536 } },
      { value: "gua-musang", label: "Gua Musang", center: { lat: 4.8833, lng: 101.9667 } },
    ],
  },
  {
    value: "malacca",
    label: "Malacca",
    center: { lat: 2.1896, lng: 102.2501 },
    daerah: [
      { value: "malacca-city", label: "Malacca City", center: { lat: 2.1896, lng: 102.2501 } },
      { value: "melaka-tengah", label: "Melaka Tengah", center: { lat: 2.1896, lng: 102.2501 } },
      { value: "alor-gajah", label: "Alor Gajah", center: { lat: 2.3804, lng: 102.2089 } },
      { value: "jasin", label: "Jasin", center: { lat: 2.309, lng: 102.4305 } },
    ],
  },
  {
    value: "negeri-sembilan",
    label: "Negeri Sembilan",
    center: { lat: 2.7297, lng: 101.9381 },
    daerah: [
      { value: "seremban", label: "Seremban", center: { lat: 2.7297, lng: 101.9381 } },
      { value: "port-dickson", label: "Port Dickson", center: { lat: 2.5228, lng: 101.7959 } },
      { value: "rembau", label: "Rembau", center: { lat: 2.5975, lng: 102.0891 } },
      { value: "jempol", label: "Jempol", center: { lat: 2.9704, lng: 102.3647 } },
      { value: "kuala-pilah", label: "Kuala Pilah", center: { lat: 2.7389, lng: 102.2487 } },
      { value: "jelebu", label: "Jelebu", center: { lat: 3.1108, lng: 102.0608 } },
      { value: "tampin", label: "Tampin", center: { lat: 2.4702, lng: 102.2318 } },
    ],
  },
  {
    value: "pahang",
    label: "Pahang",
    center: { lat: 3.8077, lng: 103.326 },
    daerah: [
      { value: "kuantan", label: "Kuantan", center: { lat: 3.8077, lng: 103.326 } },
      { value: "bentong", label: "Bentong", center: { lat: 3.5225, lng: 101.9082 } },
      { value: "bera", label: "Bera", center: { lat: 3.4516, lng: 102.4808 } },
      { value: "cameron-highlands", label: "Cameron Highlands", center: { lat: 4.4696, lng: 101.3767 } },
      { value: "jerantut", label: "Jerantut", center: { lat: 3.9367, lng: 102.3627 } },
      { value: "lipis", label: "Lipis", center: { lat: 4.1842, lng: 102.0516 } },
      { value: "maran", label: "Maran", center: { lat: 3.5902, lng: 102.7605 } },
      { value: "pekan", label: "Pekan", center: { lat: 3.4836, lng: 103.3996 } },
      { value: "raub", label: "Raub", center: { lat: 3.7899, lng: 101.857 } },
      { value: "rompin", label: "Rompin", center: { lat: 2.8073, lng: 103.4939 } },
      { value: "temerloh", label: "Temerloh", center: { lat: 3.45, lng: 102.417 } },
    ],
  },
  {
    value: "penang",
    label: "Penang",
    center: { lat: 5.4141, lng: 100.3288 },
    daerah: [
      { value: "george-town", label: "George Town", center: { lat: 5.4141, lng: 100.3288 } },
      { value: "timur-laut", label: "Timur Laut", center: { lat: 5.4112, lng: 100.3354 } },
      { value: "barat-daya", label: "Barat Daya", center: { lat: 5.2826, lng: 100.266 } },
      { value: "seberang-perai-utara", label: "Seberang Perai Utara", center: { lat: 5.4985, lng: 100.432 } },
      { value: "seberang-perai-tengah", label: "Seberang Perai Tengah", center: { lat: 5.3638, lng: 100.407 } },
      { value: "seberang-perai-selatan", label: "Seberang Perai Selatan", center: { lat: 5.2302, lng: 100.4767 } },
    ],
  },
  {
    value: "perak",
    label: "Perak",
    center: { lat: 4.5975, lng: 101.0901 },
    daerah: [
      { value: "kinta", label: "Kinta", center: { lat: 4.5921, lng: 101.0901 } },
      { value: "larut-and-matang", label: "Larut & Matang", center: { lat: 4.854, lng: 100.741 } },
      { value: "manjung", label: "Manjung", center: { lat: 4.2196, lng: 100.6982 } },
      { value: "hilir-perak", label: "Hilir Perak", center: { lat: 3.852, lng: 101.016 } },
      { value: "batang-padang", label: "Batang Padang", center: { lat: 3.9319, lng: 101.2951 } },
      { value: "kerian", label: "Kerian", center: { lat: 5.1302, lng: 100.4936 } },
      { value: "kuala-kangsar", label: "Kuala Kangsar", center: { lat: 4.7726, lng: 100.94 } },
      { value: "perak-tengah", label: "Perak Tengah", center: { lat: 4.2845, lng: 100.934 } },
      { value: "hulu-perak", label: "Hulu Perak", center: { lat: 5.01, lng: 101.12 } },
      { value: "kampar", label: "Kampar", center: { lat: 4.311, lng: 101.153 } },
      { value: "bagan-datuk", label: "Bagan Datuk", center: { lat: 3.987, lng: 100.8 } },
      { value: "muallim", label: "Muallim", center: { lat: 3.781, lng: 101.53 } },
    ],
  },
  {
    value: "perlis",
    label: "Perlis",
    center: { lat: 6.4414, lng: 100.1986 },
    daerah: [
      { value: "kangar", label: "Kangar", center: { lat: 6.4414, lng: 100.1986 } },
      { value: "arau", label: "Arau", center: { lat: 6.43, lng: 100.269 } },
      { value: "padang-besar", label: "Padang Besar", center: { lat: 6.6641, lng: 100.3216 } },
    ],
  },
  {
    value: "selangor",
    label: "Selangor",
    center: { lat: 3.0738, lng: 101.5183 },
    daerah: [
      { value: "petaling", label: "Petaling", center: { lat: 3.1073, lng: 101.6067 } },
      { value: "hulu-langat", label: "Hulu Langat", center: { lat: 3.128, lng: 101.837 } },
      { value: "gombak", label: "Gombak", center: { lat: 3.2379, lng: 101.6899 } },
      { value: "klang", label: "Klang", center: { lat: 3.0449, lng: 101.4456 } },
      { value: "kuala-langat", label: "Kuala Langat", center: { lat: 2.8108, lng: 101.502 } },
      { value: "sepang", label: "Sepang", center: { lat: 2.6931, lng: 101.7494 } },
      { value: "hulu-selangor", label: "Hulu Selangor", center: { lat: 3.5617, lng: 101.481 } },
      { value: "kuala-selangor", label: "Kuala Selangor", center: { lat: 3.3406, lng: 101.252 } },
      { value: "sabak-bernam", label: "Sabak Bernam", center: { lat: 3.7695, lng: 100.9895 } },
    ],
  },
  {
    value: "terengganu",
    label: "Terengganu",
    center: { lat: 5.3302, lng: 103.1408 },
    daerah: [
      { value: "kuala-terengganu", label: "Kuala Terengganu", center: { lat: 5.3302, lng: 103.1408 } },
      { value: "besut", label: "Besut", center: { lat: 5.8321, lng: 102.5567 } },
      { value: "setiu", label: "Setiu", center: { lat: 5.6546, lng: 102.7035 } },
      { value: "kuala-nerus", label: "Kuala Nerus", center: { lat: 5.4129, lng: 103.089 } },
      { value: "hulu-terengganu", label: "Hulu Terengganu", center: { lat: 5.0116, lng: 102.9331 } },
      { value: "marang", label: "Marang", center: { lat: 5.2069, lng: 103.2059 } },
      { value: "dungun", label: "Dungun", center: { lat: 4.755, lng: 103.417 } },
      { value: "kemaman", label: "Kemaman", center: { lat: 4.231, lng: 103.427 } },
    ],
  },
  {
    value: "sabah",
    label: "Sabah",
    center: { lat: 5.9804, lng: 116.0735 },
    daerah: [
      { value: "kudat", label: "Kudat", center: { lat: 6.887, lng: 116.823 } },
      { value: "west-coast", label: "West Coast", center: { lat: 5.9804, lng: 116.0735 } },
      { value: "interior", label: "Interior", center: { lat: 5.337, lng: 116.161 } },
      { value: "sandakan-division", label: "Sandakan", center: { lat: 5.8388, lng: 118.1179 } },
      { value: "tawau-division", label: "Tawau", center: { lat: 4.2498, lng: 117.8871 } },
      { value: "kota-kinabalu", label: "Kota Kinabalu", center: { lat: 5.9804, lng: 116.0735 } },
      { value: "sandakan", label: "Sandakan District", center: { lat: 5.8388, lng: 118.1179 } },
      { value: "tawau", label: "Tawau District", center: { lat: 4.2498, lng: 117.8871 } },
      { value: "tuaran", label: "Tuaran", center: { lat: 6.182, lng: 116.231 } },
      { value: "keningau", label: "Keningau", center: { lat: 5.337, lng: 116.161 } },
    ],
  },
  {
    value: "sarawak",
    label: "Sarawak",
    center: { lat: 1.5533, lng: 110.3592 },
    daerah: [
      { value: "kuching", label: "Kuching", center: { lat: 1.5533, lng: 110.3592 } },
      { value: "samarahan", label: "Samarahan", center: { lat: 1.4546, lng: 110.4476 } },
      { value: "serian", label: "Serian", center: { lat: 1.1764, lng: 110.5449 } },
      { value: "sri-aman", label: "Sri Aman", center: { lat: 1.2386, lng: 111.4626 } },
      { value: "betong", label: "Betong", center: { lat: 1.4105, lng: 111.5313 } },
      { value: "sarikei", label: "Sarikei", center: { lat: 2.13, lng: 111.522 } },
      { value: "sibu", label: "Sibu", center: { lat: 2.287, lng: 111.83 } },
      { value: "mukah", label: "Mukah", center: { lat: 2.8965, lng: 112.08 } },
      { value: "kapit", label: "Kapit", center: { lat: 2.0167, lng: 112.9333 } },
      { value: "bintulu", label: "Bintulu", center: { lat: 3.1667, lng: 113.0333 } },
      { value: "miri", label: "Miri", center: { lat: 4.3995, lng: 113.9914 } },
      { value: "limbang", label: "Limbang", center: { lat: 4.7521, lng: 115.0105 } },
    ],
  },
];

const negeriOptions = negeriData.map((item) => ({ value: item.value, label: item.label }));

const negeriValueMap = negeriData.reduce((accumulator, item) => {
  accumulator[item.value] = item;
  return accumulator;
}, {});

const negeriAliasMap = {
  melaka: "malacca",
  malacca: "malacca",
  "pulau-pinang": "penang",
  penang: "penang",
};

const normalizeNegeriValue = (value) => {
  const normalized = toSlug(value);
  if (!normalized) return "";
  return negeriAliasMap[normalized] || normalized;
};

const normalizeDaerahValue = (value) => toSlug(value);
const leaseOptions = [
  { value: "30-years", label: "30 Years" },
  { value: "60-years", label: "60 Years" },
  { value: "99-years", label: "99 Years" },
];
const defaultTitleTypeOptions = [
  { value: "freehold", label: "Freehold" },
  { value: "leasehold", label: "Leasehold" },
];

const LocationStep = ({ formData, updateField, titleTypeOptions = defaultTitleTypeOptions, errors = {} }) => {
  const normalizedNegeriValue = normalizeNegeriValue(formData.negeri);
  const selectedNegeri = negeriValueMap[normalizedNegeriValue] || null;
  const daerahOptions = selectedNegeri
    ? selectedNegeri.daerah.map((item) => ({ value: item.value, label: item.label }))
    : [];
  const normalizedDaerahValue = normalizeDaerahValue(formData.daerah);

  const handleNegeriChange = (nextNegeriValue) => {
    updateField("negeri", nextNegeriValue);

    const nextNegeri = negeriValueMap[nextNegeriValue] || null;
    const hasMatchingDaerah = nextNegeri?.daerah?.some(
      (item) => item.value === normalizeDaerahValue(formData.daerah)
    );

    if (!hasMatchingDaerah) {
      updateField("daerah", "");
    }

    if (nextNegeri?.center) {
      updateField("latitude", Number(nextNegeri.center.lat.toFixed(6)));
      updateField("longitude", Number(nextNegeri.center.lng.toFixed(6)));
    }
  };

  const handleDaerahChange = (nextDaerahValue) => {
    updateField("daerah", nextDaerahValue);

    const matchedDaerah = selectedNegeri?.daerah?.find((item) => item.value === nextDaerahValue);
    const targetCenter = matchedDaerah?.center || selectedNegeri?.center;

    if (targetCenter) {
      updateField("latitude", Number(targetCenter.lat.toFixed(6)));
      updateField("longitude", Number(targetCenter.lng.toFixed(6)));
    }
  };

  const normalizedTitleTypeOptions =
    Array.isArray(titleTypeOptions) && titleTypeOptions.length > 0
      ? titleTypeOptions
      : defaultTitleTypeOptions;

  const selectedTitleTypeLabel =
    normalizedTitleTypeOptions.find((option) => option.value === formData.titleType)?.label || "";
  const isLeasehold = selectedTitleTypeLabel.toLowerCase().includes("leasehold");

  const locationMarker = {
    id: "listing-location-marker",
    image: formData.photos?.[0] ? getFilePreviewUrl(formData.photos[0]) : null,
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
            value={normalizedNegeriValue}
            onChange={handleNegeriChange}
            options={negeriOptions}
            placeholder="Select Negeri"
            error={errors.negeri}
          />
          <SelectDropdown
            label="Daerah"
            value={normalizedDaerahValue}
            onChange={handleDaerahChange}
            options={daerahOptions}
            placeholder="Select Daerah"
            error={errors.daerah}
            disabled={!selectedNegeri}
          />
          <div className="relative">
            <label className="mb-2 block text-[12px] font-medium text-gray2 sm:text-[13px]">Mukim</label>
            <input
              value={formData.mukim}
              onChange={(event) => updateField("mukim", event.target.value)}
              placeholder="e.g Hulu Langat"
              className={`h-9 w-full rounded-xl border border-border-input bg-white px-3 text-[12px] text-gray2 outline-none transition focus:border-green-secondary sm:h-10 sm:px-3.5 sm:text-[13px] md:h-11 md:text-[14px] ${errors.mukim ? "border-red-400 focus:border-red-400" : ""}`.trim()}
            />
            {errors.mukim ? (
              <p className="pointer-events-none absolute left-0 top-full mt-1 text-[11px] text-red-500">{errors.mukim}</p>
            ) : null}
          </div>
          <div className="relative">
            <label className="mb-2 block text-[12px] font-medium text-gray2 sm:text-[13px]">Seksyen</label>
            <input
              value={formData.seksyen}
              onChange={(event) => updateField("seksyen", event.target.value)}
              placeholder="e.g Hulu Langat"
              className={`h-9 w-full rounded-xl border border-border-input bg-white px-3 text-[12px] text-gray2 outline-none transition focus:border-green-secondary sm:h-10 sm:px-3.5 sm:text-[13px] md:h-11 md:text-[14px] ${errors.seksyen ? "border-red-400 focus:border-red-400" : ""}`.trim()}
            />
            {errors.seksyen ? (
              <p className="pointer-events-none absolute left-0 top-full mt-1 text-[11px] text-red-500">{errors.seksyen}</p>
            ) : null}
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

      <div className="relative border-t border-border-card pt-5 sm:pt-6">
        <p className="mb-3 text-[12px] font-medium text-gray2 sm:mb-4 sm:text-[13px]">Title type</p>
        <div className="flex w-full gap-3">
          {normalizedTitleTypeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateField("titleType", option.value)}
                className={`h-9 flex-1 rounded-xl border text-[11px] font-medium transition sm:h-10 sm:text-[12px] md:text-[13px] ${
                formData.titleType === option.value ? "border-[#2F2F2F] bg-[#2F2F2F] text-white" : "border-border-input bg-white text-gray5 hover:border-[#D3D7DC]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.titleType ? (
          <p className="pointer-events-none absolute left-0 top-full mt-1 text-[11px] text-red-500">{errors.titleType}</p>
        ) : null}
        <div className="flex flex-col sm:flex-row sm:gap-3 gap-1">
          {!isLeasehold && (
            <>
              <div className="relative mt-3 flex-1">
                <LeaseholdCalendarInput
                  label="Leasehold start year"
                  value={formData.leaseStartDate}
                  calendarYear={formData.calendarYear}
                  onChange={(value) => updateField("leaseStartDate", value)}
                  onCalendarYearChange={(value) => updateField("calendarYear", value)}
                />
                {errors.leaseStartDate ? (
                  <p className="pointer-events-none absolute left-0 top-full mt-1 text-[11px] text-red-500">
                    {errors.leaseStartDate}
                  </p>
                ) : null}
              </div>
              <div className="mt-3 flex-1">
                <SelectDropdown
                  label="Leasehold Period"
                  value={formData.leasePeriod}
                  onChange={(value) => updateField("leasePeriod", value)}
                  options={leaseOptions}
                  placeholder="Select period"
                  error={errors.leasePeriod}
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
