import { StoreProvider } from "@/providers/rtk-provider";
import { AppProviders } from "@/providers/app-provider";
import { AppToaster } from "@elements/app-toaster";
import { ReactNode } from "react";
import { Metadata } from "next";

import { isIndexableDeployment } from "@/lib/site/deployment-env";
import { SITE_METADATA_BASE } from "@/lib/site/site-url";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  siteOpenGraph,
  siteTwitter,
} from "@/lib/site/page-metadata";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: SITE_METADATA_BASE,
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: siteOpenGraph({ title: SITE_NAME, description: SITE_DESCRIPTION }),
  twitter: siteTwitter({ title: SITE_NAME, description: SITE_DESCRIPTION }),
  ...(isIndexableDeployment ? {} : { robots: { index: false, follow: false } }),
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
