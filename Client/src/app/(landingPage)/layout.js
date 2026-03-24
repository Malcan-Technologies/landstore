import PublicRoute from "@/components/auth/PublicRoute";

export default function LandingPageLayout({ children }) {
  return <PublicRoute>{children}</PublicRoute>;
}
