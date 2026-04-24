import AdminRouteGate from "@/components/adminDashboard/layout/AdminRouteGate";
import AdminShell from "@/components/adminDashboard/layout/AdminShell";

export default function AdminLayout({ children }) {
  return (
    <AdminRouteGate>
      <AdminShell>{children}</AdminShell>
      {/* <div className="flex min-h-screen bg-background-primary pt-17">
      </div> */}
    </AdminRouteGate>
    // <AdminShell>
    //   {children}
    // </AdminShell>
  );
}
