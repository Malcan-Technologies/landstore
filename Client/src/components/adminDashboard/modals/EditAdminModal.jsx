"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import SelectDropdown from "@/components/common/SelectDropdown";
import { defaultCountries, parseCountry, usePhoneInput } from "react-international-phone";
import ArrowDown from "@/components/svg/ArrowDown";

export default function EditAdminModal({ open, onClose, onUpdate, admin, isLoading = false }) {
  const [formData, setFormData] = useState({ email: "", phone: "", name: "", status: "active" });
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Suspended", value: "suspended" },
  ].map((option) => ({
    ...option,
    icon: ArrowDown,
  }));
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const phoneFieldRef = useRef(null);

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
    value: formData.phone,
    countries: defaultCountries,
    disableDialCodeAndPrefix: true,
    onChange: ({ phone }) => {
      setFormData((prev) => ({ ...prev, phone: phone || "" }));
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: "" }));
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

  useEffect(() => {
    if (admin) {
      setFormData({
        email: admin.email || "",
        phone: admin.phone || "",
        name: admin.name || "",
        status: admin.status || "active",
      });
    }
  }, [admin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!formData.email.trim()) next.email = "Email is required";
    else {
      const re = /\S+@\S+\.\S+/;
      if (!re.test(formData.email.trim())) next.email = "Enter a valid email";
    }
    if (!fullPhoneNumber.trim()) next.phone = "Phone is required";
    else {
      const phoneRe = /^\+?[\d\s-]{10,}$/;
      if (!phoneRe.test(fullPhoneNumber.trim())) next.phone = "Enter a valid phone number";
    }
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.status.trim()) next.status = "Status is required";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    try {
      await onUpdate({
        email: formData.email.trim(),
        phone: fullPhoneNumber.trim(),
        name: formData.name.trim(),
        status: formData.status.trim(),
      });
    } catch (err) {
      setErrors({ submit: err?.message || "Failed to update admin" });
    }
  };

  return (
    <Modal
      open={open}
      onClose={isLoading ? () => {} : onClose}
      title="Edit admin"
      panelClassName="w-full max-w-[520px] overflow-hidden rounded-3xl bg-white px-6 py-5 text-left align-middle transition-all"
      overlayClassName="bg-black/30"
      containerClassName="flex min-h-full items-center justify-center p-4"
      closeButtonClassName="absolute right-4 top-4 text-[24px] leading-none text-[#9CA3AF] transition hover:text-[#6B7280]"
      showCloseButton
    >
      <form className="mt-4 space-y-3.5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">Email address</label>
          <input
            name="email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            readOnly
            className="h-10 w-full rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary bg-gray-50"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">Phone number</label>
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
                name="phone"
                type="tel"
                value={phoneInputValue}
                onChange={(event) => {
                  handlePhoneValueChange(event);
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: "" }));
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
          <label className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">Name</label>
          <input
            name="name"
            type="text"
            placeholder="Enter full display name"
            value={formData.name}
            onChange={handleChange}
            className="h-10 w-full rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">Status</label>
          <SelectDropdown
            value={formData.status}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, status: value }));
              if (errors.status) {
                setErrors((prev) => ({ ...prev, status: "" }));
              }
            }}
            options={statusOptions}
            placeholder="Select status"
            className="h-10 w-full"
            buttonClassName="rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none focus:border-green-primary"
            optionClassName="text-[14px]"
            position="up"
          />
          {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
        </div>

        <div className="pt-1">
          {errors.submit && <div className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">{errors.submit}</div>}
          <Button type="submit" disabled={isLoading} className="h-10 w-full justify-center rounded-lg text-[14px] font-medium">
            <span className="flex items-center gap-2">
              <span>{isLoading ? 'Updating...' : 'Update admin'}</span>
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
