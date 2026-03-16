"use client";

import { useState } from "react";

const verifiedBadge = (
  <span className="inline-flex items-center gap-1 rounded-full bg-activebg px-2 py-1 text-[11px] font-semibold text-active">
    <span className="h-2 w-2 rounded-full bg-active" aria-hidden />
    Identity Verified
  </span>
);

const memberBadge = (
  <span className="inline-flex items-center rounded-full bg-gray2 px-2 py-1 text-[11px] font-semibold text-white">
    Member ID: U123
  </span>
);

const lockIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M7 10V7a5 5 0 0 1 10 0v3M6 10h12a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const checkIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="var(--color-green-secondary)" strokeWidth="1.6" />
    <path
      d="M8 12.3L10.6 14.8L16 9.6"
      stroke="var(--color-green-secondary)"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const inputClassName =
  "h-11 w-full rounded-lg border border-border-input bg-white px-4 text-[14px] text-gray2 outline-none transition focus:border-green-secondary focus:ring-1 focus:ring-border-green disabled:bg-background-primary disabled:text-gray5";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("ridzuan.shah@estate.com");
  const [countryCode, setCountryCode] = useState("MY");
  const [phone, setPhone] = useState("+60 (555) 000-0000");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appAlerts, setAppAlerts] = useState(true);

  return (
    <main className="bg-background-primary pb-14 pt-10">
      <div className="mx-20 w-auto rounded-xl  px-5 py-7  md:px-10 md:py-9">
        <header className="mb-10">
          <h1 className="text-[42px] font-semibold leading-tight tracking-tight text-gray2">Profile</h1>
          <p className="mt-2 text-[17px] text-gray5">Manage your identity, entity verification, and preferences.</p>
        </header>

        <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            <div className="relative h-24 w-24 shrink-0 rounded-full bg-[#d8d8d8] p-0.75">
              <div className="h-full w-full rounded-full bg-linear-to-b from-[#f8e8de] via-[#edd5c5] to-[#d8c0ac]" />
              <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#2f80ed] text-[13px] font-bold text-white">
                ✓
              </span>
            </div>

            <div>
              <h2 className="text-[38px] font-semibold leading-tight text-gray2">Dato' Ridzuan Shah</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {verifiedBadge}
                {memberBadge}
              </div>
              <p className="mt-4 max-w-140 text-[17px] leading-relaxed text-gray5">
                Registered as a <span className="font-semibold text-gray2">Corporate</span> user. Access limited to verified land assets and
                mediated enquiries.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className={`inline-flex h-11 items-center justify-center rounded-lg px-5 text-[14px] font-semibold transition ${
              isEditing
                ? "bg-green-primary text-white hover:bg-green-secondary"
                : "border border-border-input bg-white text-gray2 hover:bg-background-primary"
            }`}
          >
            {isEditing ? "Save profile" : "Edit profile"}
          </button>
        </section>

        <section className="mb-10">
          <h3 className="text-[30px] font-semibold text-gray2">Contract details</h3>
          <div className="mt-5 h-px w-full bg-border-card" />

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <label htmlFor="email" className="text-[14px] font-semibold text-gray2">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className={`${inputClassName} pr-10`}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={!isEditing}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">{checkIcon}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <label htmlFor="phone" className="text-[14px] font-semibold text-gray2">
                Phone number
              </label>
              <div className="relative flex rounded-lg border border-border-input bg-white">
                <select
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  className="h-11 rounded-l-lg border-r border-border-input bg-transparent px-3 text-[14px] text-gray2 outline-none disabled:text-gray5"
                  disabled={!isEditing}
                  aria-label="Country code"
                >
                  <option value="MY">MY</option>
                  <option value="SG">SG</option>
                  <option value="ID">ID</option>
                </select>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-11 w-full rounded-r-lg bg-transparent px-4 pr-10 text-[14px] text-gray2 outline-none disabled:text-gray5"
                  disabled={!isEditing}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">{checkIcon}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[30px] font-semibold text-gray2">Entity information</h3>
            <div className="inline-flex items-center gap-2 text-[14px] text-gray5">
              <span className="text-gray5">{lockIcon}</span>
              <span>Locked after verification</span>
            </div>
          </div>
          <div className="mt-5 h-px w-full bg-border-card" />

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <span className="text-[14px] font-semibold text-gray2">Entity Type</span>
              <input type="text" className={inputClassName} value="Corporate" disabled />
            </div>

            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <span className="text-[14px] font-semibold text-gray2">Company Name</span>
              <input type="text" className={inputClassName} value="Ridzuan Holdings Sdn Bhd" disabled />
            </div>

            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <span className="text-[14px] font-semibold text-gray2">ID Number (SSM / IC)</span>
              <input type="text" className={inputClassName} value="202201012345" disabled />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[30px] font-semibold text-gray2">Notification Preferences</h3>
          <div className="mt-5 h-px w-full bg-border-card" />

          <div className="mt-6 space-y-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[18px] font-semibold text-gray2">Email Notifications</p>
                <p className="text-[14px] text-gray5">Receive weekly market reports and listing updates via email</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications((prev) => !prev)}
                className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
                  emailNotifications ? "bg-green-secondary" : "bg-border-input"
                }`}
                aria-pressed={emailNotifications}
                aria-label="Toggle email notifications"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    emailNotifications ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[18px] font-semibold text-gray2">In-App Alerts</p>
                <p className="text-[14px] text-gray5">Instant notifications for new enquiries and status changes</p>
              </div>
              <button
                type="button"
                onClick={() => setAppAlerts((prev) => !prev)}
                className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition ${
                  appAlerts ? "bg-green-secondary" : "bg-border-input"
                }`}
                aria-pressed={appAlerts}
                aria-label="Toggle in-app alerts"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    appAlerts ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
