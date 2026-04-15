"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { authService } from "@/services/authService";
import { validateForm, registerValidation } from "@/validators";
import Button from "@/components/common/Button";
import EmailConfirmationModal from "@/components/auth/modals/EmailConfirmationModal";
import PillCheckbox from "@/components/common/PillCheckbox";
import Arrow from "@/components/svg/Arrow";
import EyeClose from "@/components/svg/EyeClose";
import EyeOpen from "@/components/svg/EyeOpen";
import Building from "@/components/svg/Building";
import Person from "@/components/svg/Person";
import Persons from "@/components/svg/Persons";
import { defaultCountries, parseCountry, usePhoneInput } from "react-international-phone";
import ArrowDown from "../svg/ArrowDown";

const entityOptions = [
  { key: "koperasi", label: "Koperasi", Icon: Persons },
  { key: "company", label: "Company", Icon: Building },
  { key: "individual", label: "Individual", Icon: Person },
];

const interestOptions = [
  "Landowner",
  "Interested to sell/rent/JV",
  "Real estate agent",
  "Interested to rent a land",
  "Interested to purchase a land",
  "Represent a financial institution",
  "Real estate developer",
];

const Register = ({ onRegisterSuccess }) => {
  const [entityType, setEntityType] = useState("individual");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([
    "Landowner",
    "Interested to sell/rent/JV",
  ]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const phoneFieldRef = useRef(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    // Entity-specific fields
    identityNo: "",
    companyName: "",
    koperasiName: "",
    registrationNo: "",
  });

  const fields = useMemo(() => {
    if (entityType === "company") {
      return {
        secondLabel: "Company name",
        secondPlaceholder: "As per SSM registration",
        thirdLabel: "SSM registration number",
        thirdPlaceholder: "e.g 20230101234 (123456-X)",
      };
    }

    if (entityType === "koperasi") {
      return {
        secondLabel: "Koperasi name",
        secondPlaceholder: "Full registered name",
        thirdLabel: "Koperasi reg. number",
        thirdPlaceholder: "e.g W-0-0123",
      };
    }

    return {
      secondLabel: "IC number",
      secondPlaceholder: "e.g 900101-01-1234",
      thirdLabel: "Email address",
      thirdPlaceholder: "Enter email",
    };
  }, [entityType]);

  const countryOptions = useMemo(
    () => defaultCountries.map((countryData) => parseCountry(countryData)).filter(Boolean),
    []
  );

  const {
    phone: fullPhoneNumber,
    inputValue: phoneInputValue,
    country: selectedCountry,
    setCountry,
    handlePhoneValueChange,
  } = usePhoneInput({
    defaultCountry: "my",
    value: phoneNumber,
    countries: defaultCountries,
    disableDialCodeAndPrefix: true,
    onChange: ({ phone }) => {
      setPhoneNumber(phone || "");

      if (errors.phone) {
        setErrors((prev) => ({
          ...prev,
          phone: "",
        }));
      }
    },
  });

  useEffect(() => {
    if (!isCountryDropdownOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (phoneFieldRef.current && !phoneFieldRef.current.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isCountryDropdownOpen]);

  const toggleInterest = (option) => {
    setSelectedInterests((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const normalizeRegisterPhone = (value, visibleInputValue) => {
    const normalizedValue = String(value || "").trim();
    const visibleDigits = String(visibleInputValue || "").replace(/\D/g, "");

    if (!normalizedValue || !visibleDigits) {
      return "";
    }

    return normalizedValue;
  };

  const buildRegisterPayload = () => {
    const fullName = formData.fullName.trim();
    const payload = {
      email: formData.email.trim(),
      password: formData.password,
      name: fullName,
      userType: "user",
      profileType: entityType,
    };

    const normalizedPhone = normalizeRegisterPhone(fullPhoneNumber, phoneInputValue);
    if (normalizedPhone) {
      payload.phone = normalizedPhone;
    }

    if (entityType === "individual") {
      payload.fullName = fullName;
      payload.identityNo = formData.identityNo.trim();
    }

    if (entityType === "company") {
      payload.companyName = formData.companyName.trim();
      payload.registrationNo = formData.registrationNo.trim();
    }

    if (entityType === "koperasi") {
      payload.koperasiName = formData.koperasiName.trim();
      payload.registrationNo = formData.registrationNo.trim();
    }

    return payload;
  };

  const validateRegisterPayload = (payload) => {
    const nextErrors = {};

    const baseValidation = validateForm(
      {
        email: payload.email,
        password: payload.password,
        name: payload.name,
      },
      registerValidation
    );

    Object.assign(nextErrors, baseValidation.errors);

    if (!payload.name) {
      nextErrors.fullName = "Full name is required";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please reconfirm your password";
    }

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if ((entityType === "individual" || entityType === "company") && !payload.phone) {
      nextErrors.phone = "Phone number is required";
    }

    if (entityType === "individual" && !payload.identityNo) {
      nextErrors.identityNo = "Identity number is required for individual profiles";
    }

    if (entityType === "company" && !payload.companyName) {
      nextErrors.companyName = "Company name is required for company profiles";
    }

    if (entityType === "koperasi" && !payload.koperasiName) {
      nextErrors.koperasiName = "Koperasi name is required for koperasi profiles";
    }

    if ((entityType === "company" || entityType === "koperasi") && !payload.registrationNo) {
      nextErrors.registrationNo = "Registration number is required";
    }

    return nextErrors;
  };

  const resetRegisterState = () => {
    setEntityType("individual");
    setPhoneNumber("");
    setIsCountryDropdownOpen(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSelectedInterests([
      "Landowner",
      "Interested to sell/rent/JV",
    ]);
    setIsLoading(false);
    setErrors({});
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      identityNo: "",
      companyName: "",
      koperasiName: "",
      registrationNo: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const registerPayload = buildRegisterPayload();
      const payloadErrors = validateRegisterPayload(registerPayload);

      if (Object.keys(payloadErrors).length > 0) {
        setErrors(payloadErrors);
        return;
      }

      // Single API for all profile types; fields change by profileType.
      const registerResponse = await authService.register(registerPayload);

      if (registerResponse?.success || registerResponse?.profile || registerResponse?.user) {
        setIsEmailModalOpen(true);
      } else {
        setErrors({ submit: registerResponse?.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseEmailModal = () => setIsEmailModalOpen(false);

  const handleConfirmEmailModal = () => {
    setIsEmailModalOpen(false);
    resetRegisterState();
    onRegisterSuccess?.();
  };

  const handleResendEmail = () => {
    console.info("Resend verification email clicked");
  };

  return (
    <>
      <form className="mt-4 space-y-3.5" onSubmit={handleSubmit}>
      <div>
        <p className="mb-2 block text-[14px] font-medium text-gray7 md:text-[15px]">Entity Type</p>
        <div className="grid grid-cols-3 gap-2">
          {entityOptions.map(({ key, label, Icon }) => {
            const active = entityType === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setEntityType(key)}
                className={`flex min-h-18 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-[11px] font-medium transition ${active ? "border-border-card bg-white text-gray2 shadow-sm" : "border-border-input bg-background-primary text-gray2"}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="register-full-name" className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">
          Full name
        </label>
        <input
          id="register-full-name"
          name="fullName"
          type="text"
          placeholder="Enter name"
          value={formData.fullName}
          onChange={handleInputChange}
          className="h-10 w-full rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
        />
        {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="register-second" className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">
          {fields.secondLabel}
        </label>
        <input
          id="register-second"
          name={entityType === "individual" ? "identityNo" : entityType === "company" ? "companyName" : "koperasiName"}
          type="text"
          placeholder={fields.secondPlaceholder}
          value={entityType === "individual" ? formData.identityNo : entityType === "company" ? formData.companyName : formData.koperasiName}
          onChange={handleInputChange}
          className="h-10 w-full rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
        />
        {errors[entityType === "individual" ? "identityNo" : entityType === "company" ? "companyName" : "koperasiName"] && (
          <p className="mt-1 text-xs text-red-500">{errors[entityType === "individual" ? "identityNo" : entityType === "company" ? "companyName" : "koperasiName"]}</p>
        )}
      </div>

      {entityType !== "individual" ? (
        <div>
          <label htmlFor="register-third" className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">
            {fields.thirdLabel}
          </label>
          <input
            id="register-third"
            name="registrationNo"
            type="text"
            placeholder={fields.thirdPlaceholder}
            value={formData.registrationNo}
            onChange={handleInputChange}
            className="h-10 w-full rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
          />
          {errors.registrationNo && <p className="mt-1 text-xs text-red-500">{errors.registrationNo}</p>}
        </div>
      ) : null}

      <div>
        <label htmlFor="register-email" className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">
          Email address
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleInputChange}
          className="h-10 w-full rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="register-phone" className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">
          Phone number
        </label>
        <div ref={phoneFieldRef} className="relative">
          <div className="flex h-10 w-full items-center rounded-xl border border-border-input bg-white text-[14px] text-gray2 focus-within:border-green-primary">
            <button
              type="button"
              onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
              className="ml-1 flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-[14px] font-medium text-gray2 hover:bg-background-primary"
            >
              <span className="uppercase">{String(selectedCountry?.iso2 || "my").toUpperCase()}</span>
              <ArrowDown
                size={12}
                color="#9AA3AF"
                className={`${isCountryDropdownOpen ? "rotate-180" : "rotate-0"} transition-transform`}
              />
            </button>
            <span className="mx-1 h-5 w-px bg-border-input" />
            <span className="mr-2 shrink-0 text-[14px] text-gray5">+{selectedCountry?.dialCode || "60"}</span>
            <input
              id="register-phone"
              name="phone"
              type="tel"
              value={phoneInputValue}
              onChange={(event) => {
                handlePhoneValueChange(event);

                if (errors.phone) {
                  setErrors((prev) => ({
                    ...prev,
                    phone: "",
                  }));
                }
              }}
              placeholder="Enter phone number"
              className="h-full w-full min-w-0 bg-transparent pr-3 text-[14px] text-gray2 outline-none placeholder:text-gray5"
            />
          </div>

          {isCountryDropdownOpen && (
            <div className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border-input bg-white py-1 shadow-[0px_12px_24px_rgba(15,61,46,0.08)]">
              {countryOptions.map((option) => {
                const isSelected = option.iso2 === selectedCountry?.iso2;

                return (
                  <button
                    key={option.iso2}
                    type="button"
                    onClick={() => {
                      setCountry(option.iso2, { focusOnInput: false });
                      setIsCountryDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] ${
                      isSelected ? "bg-[#F4F7F5] text-gray2" : "text-gray5 hover:bg-[#F8FAF9]"
                    }`}
                  >
                    <span className="w-7 shrink-0 font-medium uppercase text-gray2">{option.iso2}</span>
                    <span className="w-12 shrink-0 text-gray5">+{option.dialCode}</span>
                    <span className="truncate">{option.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="register-password" className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">
          Password
        </label>
        <div className="relative">
          <input
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="**********"
            value={formData.password}
            autoComplete="new-password"
            onChange={handleInputChange}
            className="h-10 w-full rounded-xl border border-border-input px-3.5 pr-10 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray5"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOpen size={14} /> : <EyeClose size={14} />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="register-confirm-password" className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">
          Reconfirm password
        </label>
        <div className="relative">
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="**********"
            value={formData.confirmPassword}
            autoComplete="new-password"
            onChange={handleInputChange}
            className="h-10 w-full rounded-xl border border-border-input px-3.5 pr-10 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray5"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? <EyeOpen size={14} /> : <EyeClose size={14} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
      </div>

      <div>
        <p className="mb-2 block text-[13px] font-medium text-gray7 md:text-[14px]">
          Entity type (What you are and what is your interests?)
        </p>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((option) => {
            const isSelected = selectedInterests.includes(option);
            return (
              <PillCheckbox
                key={option}
                checked={isSelected}
                label={option}
                onChange={() => toggleInterest(option)}
              />
            );
          })}
        </div>
      </div>

        <div className="pt-1">
          {errors.submit && (
            <div className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">
              {errors.submit}
            </div>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 w-full justify-center rounded-lg text-[14px] font-medium"
          >
            <span className="flex items-center gap-2">
              <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
              {!isLoading && <Arrow size={14} color="white" />}
            </span>
          </Button>
          <p className="mx-auto mt-2.5 max-w-130 text-center text-[11px] leading-4 text-gray5">
            By continuing, you agree to Landstore&apos;s Professional Standards and Anti-Bypass Policy.
          </p>
        </div>
      </form>

      <EmailConfirmationModal
        open={isEmailModalOpen}
        onClose={handleCloseEmailModal}
        onConfirm={handleConfirmEmailModal}
        onResend={handleResendEmail}
      />
    </>
  );
};

export default Register;
