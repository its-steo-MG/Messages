import "./globals.css";
import type { Metadata, Viewport } from "next";
import NotificationProvider from "@/components/NotificationProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Messages",
  description: "M-Pesa Messages",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Messages",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sf bg-black text-white min-h-screen">
        <NotificationProvider>{children}</NotificationProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
