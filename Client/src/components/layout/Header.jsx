"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Plus from "@/components/svg/Plus";
import Button from "@/components/common/Button";
import LoginModal from "@/components/auth/LoginModal";

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login");

  return (
    <>
      <div className="shadow-sm bg-white">
        <div className="mx-auto flex w-full max-w-[95vw] items-center justify-between gap-6 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 md:h-12 md:w-12">
              <Image
                src="/logo.png"
                alt="LandStore"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-lg font-bold text-green-logo">
              LandStore<span className="text-green-secondary font-normal">.my</span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium text-[#1A1A1A] lg:flex">
            <Link href="/explore" className="transition hover:text-green-primary">
              Explore Map
            </Link>
            <Link href="#" className="transition hover:text-green-primary">
              Shortlists
            </Link>
            <Link href="#" className="transition hover:text-green-primary">
              My Enquiries
            </Link>
          </nav>

          <div className="flex items-center gap-3 text-sm font-medium">
            <Button href="#" className="rounded-lg" label="List a land">
              <span className="flex h-6 w-6 items-center justify-center text-white">
                <Plus size={14} color="white" aria-hidden />
              </span>
            </Button>
            <span className="h-6 w-[1.5px] bg-[#BABABA]" aria-hidden />
            <Button
              onClick={() => {
                setAuthTab("login");
                setIsLoginOpen(true);
              }}
              colorClass="bg-white text-green-primary border border-border-green hover:bg-font-green"
              className="h-10 rounded-md"
              label="Login"
            />
            <Button
              onClick={() => {
                setAuthTab("register");
                setIsLoginOpen(true);
              }}
              colorClass="bg-font-green text-green-primary focus:ring-1 focus:ring-border-green hover:bg-font-green"
              className="h-10 rounded-md"
              label="Register"
            />
          </div>
        </div>
      </div>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialTab={authTab} />
    </>
  );
};

export default Header;
