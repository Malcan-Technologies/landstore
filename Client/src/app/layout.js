import { Inter } from "next/font/google";
import "./globals.css";
import AppLayoutShell from "@/components/layout/AppLayoutShell";
import ReduxProvider from "@/components/providers/ReduxProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Land Market Place",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${inter.className} antialiased min-h-screen w-full overflow-x-hidden bg-background-primary`}
      >
        <ReduxProvider>
          <AppLayoutShell>{children}</AppLayoutShell>
        </ReduxProvider>
      </body>
    </html>
  );
}
