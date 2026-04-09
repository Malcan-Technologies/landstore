"use client";

import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/authSlice";
import { authService } from "@/services/authService";
import { validateForm, registerValidation, completeProfileValidation } from "@/validators";
import Button from "@/components/common/Button";
import EmailConfirmationModal from "@/components/auth/modals/EmailConfirmationModal";
import PillCheckbox from "@/components/common/PillCheckbox";
import Arrow from "@/components/svg/Arrow";
import EyeClose from "@/components/svg/EyeClose";
import EyeOpen from "@/components/svg/EyeOpen";
import Building from "@/components/svg/Building";
import Person from "@/components/svg/Person";
import Persons from "@/components/svg/Persons";

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
  const dispatch = useDispatch();
  const [entityType, setEntityType] = useState("individual");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState([
    "Landowner",
    "Interested to sell/rent/JV",
  ]);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('🚀 Form submitted!');
    setIsLoading(true);
    setErrors({});

    try {
      // Prepare all data first
      const registerData = {
        email: formData.email,
        password: formData.password,
        name: formData.fullName
      };

      const fullPhoneNumber = phoneNumber ? `+60${phoneNumber}` : (formData.phone ? `+60${formData.phone}` : '');
      const profileData = {
        email: formData.email,
        profileType: entityType,
        phone: fullPhoneNumber,
        userType: "user",
        interests: selectedInterests
      };

      // Add entity-specific fields
      if (entityType === "individual") {
        profileData.fullName = formData.fullName;
        profileData.firstName = formData.fullName.split(' ')[0];
        profileData.lastName = formData.fullName.split(' ').slice(1).join(' ');
        profileData.identityNo = formData.identityNo || '';
      } else if (entityType === "company") {
        profileData.companyName = formData.companyName || '';
        profileData.registrationNo = formData.registrationNo || '';
      } else if (entityType === "koperasi") {
        profileData.koperasiName = formData.koperasiName || '';
        profileData.registrationNo = formData.registrationNo || '';
      }

      console.log('📋 Registration data:', registerData);
      console.log('📋 Profile data:', profileData);

      // VALIDATE EVERYTHING BEFORE MAKING ANY API CALLS
      const validation = validateForm(registerData, registerValidation);
      console.log('✅ Validation result:', validation);
      
      if (!validation.isValid) {
        console.log('❌ Validation failed:', validation.errors);
        setErrors(validation.errors);
        setIsLoading(false);
        return;
      }

      // Check password confirmation
      if (formData.password !== formData.confirmPassword) {
        console.log('❌ Passwords do not match');
        setErrors({ confirmPassword: 'Passwords do not match' });
        setIsLoading(false);
        return;
      }

      // Validate profile data
      const profileValidation = validateForm(profileData, completeProfileValidation);
      console.log('✅ Profile validation result:', profileValidation);
      
      if (!profileValidation.isValid) {
        console.log('❌ Profile validation failed:', profileValidation.errors);
        setErrors(profileValidation.errors);
        setIsLoading(false);
        return;
      }

      console.log('✅ All validations passed, proceeding with API calls...');

      // Step 1: Register with Better Auth
      console.log('📡 Calling register API...');
      const registerResponse = await authService.register(registerData);
      console.log('📥 Register response:', registerResponse);
      
      if (registerResponse.success || registerResponse.user) {
        console.log('✅ Registration successful, completing profile...');

        console.log('📡 Calling complete-profile API...');
        const profileResponse = await authService.completeProfile(profileData);
        console.log('📥 Profile response:', profileResponse);
        
        if (profileResponse.success || profileResponse.user) {
          // Update Redux store with user data
          const userData = profileResponse.user || profileResponse.result?.user || registerResponse.user;
          if (userData) {
            dispatch(loginSuccess(userData));
          }
          setIsEmailModalOpen(true);
        } else {
          setErrors({ submit: profileResponse.message || 'Failed to complete profile' });
        }
      } else {
        setErrors({ submit: registerResponse.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseEmailModal = () => setIsEmailModalOpen(false);
  const handleResendEmail = () => {
    console.info("Resend verification email clicked");
  };

  return (
    <>
      {console.log("Register component rendered")}
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
                className={`flex min-h-[72px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-[11px] font-medium transition ${active ? "border-border-card bg-white text-gray2 shadow-sm" : "border-border-input bg-background-primary text-gray2"}`}
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
        <div className="flex h-10 items-center rounded-xl border border-border-input px-3.5 text-[14px] text-gray2">
          <span className="pr-3">MY</span>
          <span className="pr-3 text-gray5">+60</span>
          <input
            id="register-phone"
            name="phone"
            type="tel"
            value={phoneNumber}
            onChange={(event) => {
              setPhoneNumber(event.target.value);
              handleInputChange(event);
            }}
            placeholder="Enter phone number"
            className="h-full w-full bg-transparent text-[14px] text-gray2 outline-none placeholder:text-gray5"
          />
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
          <p className="mx-auto mt-2.5 max-w-[520px] text-center text-[11px] leading-4 text-gray5">
            By continuing, you agree to Landstore&apos;s Professional Standards and Anti-Bypass Policy.
          </p>
        </div>
      </form>

      <EmailConfirmationModal
        open={isEmailModalOpen}
        onClose={handleCloseEmailModal}
        onResend={handleResendEmail}
      />
    </>
  );
};

export default Register;
