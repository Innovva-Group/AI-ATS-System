import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI ATS | Submit Your Application",
  description: "Submit your application and CV.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
