"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

const AppLayoutShell = ({ children }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <>
      {!isAdminRoute ? <Header /> : null}
      <div className={isAdminRoute ? "" : "pt-10"}>{children}</div>
    </>
  );
};

export default AppLayoutShell;
