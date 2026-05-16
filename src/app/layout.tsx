import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "PocketFirewall",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PocketFirewall",
  },
  title: "PocketFirewall",
  description: "Personal budgeting web app for tracking daily income and expenses.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    apple: [
      { sizes: "180x180", url: "/icons/apple-touch-icon.png" },
    ],
    icon: [
      { sizes: "192x192", type: "image/png", url: "/icons/icon-192.png" },
      { sizes: "512x512", type: "image/png", url: "/icons/icon-512.png" },
    ],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: "#111111",
  viewportFit: "cover",
  width: "device-width",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
