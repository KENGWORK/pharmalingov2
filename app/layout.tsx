import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// viewportFit "cover" lets the page draw under the Dynamic Island / home indicator;
// page.tsx pads with env(safe-area-inset-*). Zoom stays off so inputs don't jump.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "Pharma Lingo",
  description: "Assistance Dispenser App",
  icons: {
    icon: "/apple-touch-iconv2.png",
    apple: "/apple-touch-iconv2.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pharma Lingo",
  },
  // Next only emits the unprefixed mobile-web-app-capable; iOS home-screen apps still read the apple- one.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overscroll-none">
        {children}
      </body>
    </html>
  );
}
