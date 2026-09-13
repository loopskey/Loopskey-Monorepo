import { StoreProvider } from "@/providers/rtk-provider";
import { AppProviders } from "@/providers/app-provider";
import { AppToaster } from "@elements/app-toaster";
import { ReactNode } from "react";
import { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Loopskey",
  description:
    "Professional learning, CPD, events, providers and organization.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <StoreProvider>
          <AppProviders>
            <AppToaster />
            {children}
          </AppProviders>
        </StoreProvider>
      </body>
    </html>
  );
}
