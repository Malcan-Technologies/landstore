"use client";

import { useState } from "react";
import AdminHeader from "@/components/adminDashboard/layout/AdminHeader";
import SideBar from "@/components/adminDashboard/layout/SideBar";

const AdminShell = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background-primary">
      <SideBar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col sm:h-screen sm:overflow-hidden">
        <AdminHeader onMenuClick={() => setMobileSidebarOpen(true)} />
        <div className="min-w-0 flex-1 overflow-visible sm:min-h-0 sm:overflow-hidden">{children}</div>
      </div>
    </div>
  );
};

export default AdminShell;
