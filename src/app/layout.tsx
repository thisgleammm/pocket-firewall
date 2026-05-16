import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PocketFirewall",
  description: "Personal budgeting web app for tracking daily income and expenses.",
};

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
