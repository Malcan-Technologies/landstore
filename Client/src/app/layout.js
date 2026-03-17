import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
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
        className={`${inter.className} antialiased min-h-screen w-full overflow-x-hidden bg-background-primary`}
      >
        <ReduxProvider>
          <Header />
          <div  className="pt-10">
            {children}
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
