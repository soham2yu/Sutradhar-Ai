import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sutradhar — AI Incident Commander",
  description: "Real-time AI-powered incident intelligence for engineering teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
