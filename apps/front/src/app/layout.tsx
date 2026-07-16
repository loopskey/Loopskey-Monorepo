import { LearningParticlesBackground } from "@elements/particles-background";
import { StoreProvider } from "@/providers/rtk-provider";
import { AppProviders } from "@/providers/app-provider";
import { AppToaster } from "@elements/app-toaster";
import { ReactNode } from "react";
import { Metadata } from "next";

import Header from "@layouts/Header";
import Footer from "@layouts/Footer";

import "./globals.css";

export const metadata: Metadata = {
  title: "Loopskey",
  description:
    "Professional learning, CPD, events, providers and organization.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background text-foreground antialiased transition-colors"
      >
        <StoreProvider>
          <AppProviders>
            <LearningParticlesBackground />
            <AppToaster />
            <Header />
            {children}
            <Footer />
          </AppProviders>
        </StoreProvider>
      </body>
    </html>
  );
}
