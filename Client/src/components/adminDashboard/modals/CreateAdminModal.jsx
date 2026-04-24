"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import EyeOpen from "@/components/svg/EyeOpen";
import EyeClose from "@/components/svg/EyeClose";

export default function CreateAdminModal({ open, onClose, onCreate, isLoading = false }) {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!formData.fullName.trim()) next.fullName = "Full name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else {
      const re = /\S+@\S+\.\S+/;
      if (!re.test(formData.email.trim())) next.email = "Enter a valid email";
    }
    if (!formData.password) next.password = "Password is required";
    if (!formData.confirmPassword) next.confirmPassword = "Please confirm password";
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }
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
      await onCreate({ name: formData.fullName.trim(), email: formData.email.trim(), password: formData.password, emailVerified: true });
      setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setErrors({ submit: err?.message || "Failed to create admin" });
    }
  };

  return (
    <Modal
      open={open}
      onClose={isLoading ? () => {} : onClose}
      title="Create admin"
      panelClassName="w-full max-w-[520px] overflow-hidden rounded-3xl bg-white px-6 py-5 text-left align-middle transition-all"
      overlayClassName="bg-black/30"
      containerClassName="flex min-h-full items-center justify-center p-4"
      closeButtonClassName="absolute right-4 top-4 text-[24px] leading-none text-[#9CA3AF] transition hover:text-[#6B7280]"
      showCloseButton
    >
      <form className="mt-4 space-y-3.5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">Full name</label>
          <input
            name="fullName"
            type="text"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={handleChange}
            className="h-10 w-full rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">Email address</label>
          <input
            name="email"
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            className="h-10 w-full rounded-xl border border-border-input px-3.5 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="**********"
              value={formData.password}
              onChange={handleChange}
              className="h-10 w-full rounded-xl border border-border-input px-3.5 pr-10 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray5" aria-label="Toggle password visibility">
              {showPassword ? <EyeOpen size={14} /> : <EyeClose size={14} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[14px] font-medium text-gray7 md:text-[15px]">Reconfirm password</label>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="**********"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="h-10 w-full rounded-xl border border-border-input px-3.5 pr-10 text-[14px] text-gray2 outline-none placeholder:text-gray5 focus:border-green-primary"
            />
            <button type="button" onClick={() => setShowConfirmPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray5" aria-label="Toggle confirm password visibility">
              {showConfirmPassword ? <EyeOpen size={14} /> : <EyeClose size={14} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>

        <div className="pt-1">
          {errors.submit && <div className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">{errors.submit}</div>}
          <Button type="submit" disabled={isLoading} className="h-10 w-full justify-center rounded-lg text-[14px] font-medium">
            <span className="flex items-center gap-2">
              <span>{isLoading ? 'Creating...' : 'Create admin'}</span>
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
