import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/trpc/client";
import { Geist } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "sonner";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Play",
  description: "A modern video-sharing platform built using Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body className={`${geist.className} antialiased`}>
          <TRPCProvider>
            <Toaster />
            {children}
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
