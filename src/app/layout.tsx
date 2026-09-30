import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "KavionQuestion — Super Admin Platform",
  description: "Internal Super Admin Management Console for SchoolPapers AI",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#FFFDFB] text-[#181E4B] selection:bg-[#DF6951] selection:text-white">
        {children}
        <Toaster position="top-right" richColors theme="light" />
      </body>
    </html>
  );
}
