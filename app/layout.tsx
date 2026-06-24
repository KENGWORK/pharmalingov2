import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🛠️ ตั้งค่า Viewport ป้องกันการซูม (Input 16px) และกำหนดสีธีมแอป
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f172a",
};

// 🛠️ ตั้งค่า Metadata พื้นฐาน
export const metadata: Metadata = {
  title: "Pharma Lingo",
  description: "Assistance Dispenser App",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pharma Lingo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* 👇 1. บังคับ iPhone เรียกใช้ไอคอนจาก public/apple-touch-icon.png 👇 */}
        <link rel="apple-touch-iconv2" href="/apple-touch-iconv2.png" />
        
        {/* 👇 2. เชื่อมต่อไฟล์ manifest.json จาก public 👇 */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* 👇 3. แท็กเสริมความชัวร์สำหรับ iOS PWA 👇 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/apple-touch-iconv2.png" />
      </head>
      <body className="min-h-full flex flex-col overscroll-none">
        {children}
      </body>
    </html>
  );
}
