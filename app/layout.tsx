import type { Metadata } from "next";
import PWARegister from "@/components/PWARegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ultimate Base Lab v1 — Standards-first client-side base encoder and decoder",
  description: "A privacy-first browser-only base encoding lab for RFC Base64, Base32, Base16, Base45, Z85, MIME Base64, PEM Base64 body, Base58, Base85, Base91, Base65536 and more.",
  manifest: "/manifest.json"
};

export const viewport = {
  themeColor: "#ffffff"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
