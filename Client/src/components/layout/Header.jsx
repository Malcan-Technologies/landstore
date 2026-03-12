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
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
        <div className="flex w-full items-center justify-between px-4 py-3 md:px-6">
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
              className="rounded-md"
              label="Login"
            />
            <Button
              onClick={() => {
                setAuthTab("register");
                setIsLoginOpen(true);
              }}
              colorClass="bg-font-green text-green-primary border border-border-green hover:bg-font-green"
              className="rounded-md"
              label="Register"
            />
          </div>
        </div>
      </header>

      <LoginModal open={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialTab={authTab} />
    </>
  );
};

export default Header;
