import { PreferredLanguageProvider } from "@/providers/preferred-language-provider";
import { DEFAULT_PUBLIC_LOCALE } from "@/lib/i18n/locale";
import { StoreProvider } from "@/providers/rtk-provider";
import { ReactNode } from "react";
import { notFound } from "next/navigation";

type TAppLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const AppLayout = async ({ children, params }: TAppLayoutProps) => {
  const { locale } = await params;
  if (locale !== DEFAULT_PUBLIC_LOCALE) notFound();
  return (
    <StoreProvider>
      <PreferredLanguageProvider>{children}</PreferredLanguageProvider>
    </StoreProvider>
  );
};

export default AppLayout;
