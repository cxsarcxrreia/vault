import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative Agency Client Portal",
  description: "Minimal client portal MVP for creative agency operations."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
