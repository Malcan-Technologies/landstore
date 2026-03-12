"use client";

import { useMemo, useState } from "react";
import Button from "@/components/common/Button";
import Arrow from "@/components/svg/Arrow";
import EyeClose from "@/components/svg/EyeClose";
import EyeOpen from "@/components/svg/EyeOpen";
import Building from "@/components/svg/Building";
import Person from "@/components/svg/Person";
import Persons from "@/components/svg/Persons";
import Tick from "@/components/svg/Tick";

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

const Register = () => {
  const [entityType, setEntityType] = useState("individual");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([
    "Landowner",
    "Interested to sell/rent/JV",
  ]);

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

  const toggleInterest = (option) => {
    setSelectedInterests((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  };

  return (
    <form className="mt-4 space-y-3.5">
      <div>
        <p className="mb-2 block text-[14px] font-medium text-[#4A4A4A] md:text-[15px]">Entity Type</p>
        <div className="grid grid-cols-3 gap-2">
          {entityOptions.map(({ key, label, Icon }) => {
            const active = entityType === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setEntityType(key)}
                className={`flex min-h-[72px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-[11px] font-medium transition ${
                  active
                    ? "border-[#707070] bg-white text-[#1A1A1A] shadow-sm"
                    : "border-[#E5E7EB] bg-[#FCFCFC] text-[#262626]"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="register-full-name" className="mb-1.5 block text-[14px] font-medium text-[#4A4A4A] md:text-[15px]">
          Full name
        </label>
        <input
          id="register-full-name"
          type="text"
          placeholder="Enter name"
          className="h-10 w-full rounded-xl border border-[#D7DEE7] px-3.5 text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#B3B3B3] focus:border-green-primary"
        />
      </div>

      <div>
        <label htmlFor="register-second" className="mb-1.5 block text-[14px] font-medium text-[#4A4A4A] md:text-[15px]">
          {fields.secondLabel}
        </label>
        <input
          id="register-second"
          type="text"
          placeholder={fields.secondPlaceholder}
          className="h-10 w-full rounded-xl border border-[#D7DEE7] px-3.5 text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#B3B3B3] focus:border-green-primary"
        />
      </div>

      {entityType !== "individual" ? (
        <div>
          <label htmlFor="register-third" className="mb-1.5 block text-[14px] font-medium text-[#4A4A4A] md:text-[15px]">
            {fields.thirdLabel}
          </label>
          <input
            id="register-third"
            type="text"
            placeholder={fields.thirdPlaceholder}
            className="h-10 w-full rounded-xl border border-[#D7DEE7] px-3.5 text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#B3B3B3] focus:border-green-primary"
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="register-email" className="mb-1.5 block text-[14px] font-medium text-[#4A4A4A] md:text-[15px]">
          Email address
        </label>
        <input
          id="register-email"
          type="email"
          placeholder="Enter email"
          className="h-10 w-full rounded-xl border border-[#D7DEE7] px-3.5 text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#B3B3B3] focus:border-green-primary"
        />
      </div>

      <div>
        <label htmlFor="register-phone" className="mb-1.5 block text-[14px] font-medium text-[#4A4A4A] md:text-[15px]">
          Phone number
        </label>
        <div className="flex h-10 items-center rounded-xl border border-[#D7DEE7] px-3.5 text-[14px] text-[#1A1A1A]">
          <span className="pr-3">MY</span>
          <span className="pr-3 text-[#B3B3B3]">+60</span>
          <input
            id="register-phone"
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="Enter phone number"
            className="h-full w-full bg-transparent text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#B3B3B3]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="register-password" className="mb-1.5 block text-[14px] font-medium text-[#4A4A4A] md:text-[15px]">
          Password
        </label>
        <div className="relative">
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="**********"
            className="h-10 w-full rounded-xl border border-[#D7DEE7] px-3.5 pr-10 text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#B3B3B3] focus:border-green-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#6B6B6B]"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOpen size={14} /> : <EyeClose size={14} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="register-confirm-password" className="mb-1.5 block text-[14px] font-medium text-[#4A4A4A] md:text-[15px]">
          Reconfirm password
        </label>
        <div className="relative">
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="**********"
            className="h-10 w-full rounded-xl border border-[#D7DEE7] px-3.5 pr-10 text-[14px] text-[#1A1A1A] outline-none placeholder:text-[#B3B3B3] focus:border-green-primary"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#6B6B6B]"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? <EyeOpen size={14} /> : <EyeClose size={14} />}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 block text-[13px] font-medium text-[#4A4A4A] md:text-[14px]">
          Entity type (What you are and what is your interests?)
        </p>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((option) => {
            const isSelected = selectedInterests.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleInterest(option)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                  isSelected
                    ? "border-[#B7D7C8] bg-[#F3FBF7] text-green-primary"
                    : "border-[#D8DDE3] bg-white text-[#262626]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {isSelected ? <Tick /> : null}
                  <span>{option}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-1">
        <Button
          type="submit"
          className="h-10 w-full justify-center rounded-lg text-[14px] font-medium"
        >
          <span className="flex items-center gap-2">
            <span>Create account</span>
            <Arrow size={14} color="white" />
          </span>
        </Button>
        <p className="mx-auto mt-2.5 max-w-[520px] text-center text-[11px] leading-4 text-[#8A8A8A]">
          By continuing, you agree to Landstore's Professional Standards and Anti-Bypass Policy.
        </p>
      </div>
    </form>
  );
};

export default Register;
