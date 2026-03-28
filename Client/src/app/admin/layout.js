import AdminRouteGate from "@/components/adminDashboard/layout/AdminRouteGate";
import AdminShell from "@/components/adminDashboard/layout/AdminShell";

export default function AdminLayout({ children }) {
  const adminEmail = process.env.admin || "";
  const adminPassword = process.env.adminpassword || "";
  console.log("Env: ", process.env)
  return (
    <AdminRouteGate adminEmail={adminEmail} adminPassword={adminPassword}>
      <AdminShell>{children}</AdminShell>
      {/* <div className="flex min-h-screen bg-background-primary pt-17">
      </div> */}
    </AdminRouteGate>
  );
}
