import AuthGuard from "@/components/auth/AuthGuard";

export default function UserDashboardLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}
