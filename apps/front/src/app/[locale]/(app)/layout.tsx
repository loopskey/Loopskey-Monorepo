import { LanguageProvider } from "@/providers/language-provider";
import { DEFAULT_PUBLIC_LOCALE } from "@/lib/i18n/locale";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

type TAppLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const AppLayout = async ({ children, params }: TAppLayoutProps) => {
  const { locale } = await params;
  if (locale !== DEFAULT_PUBLIC_LOCALE) notFound();
  return <LanguageProvider>{children}</LanguageProvider>;
};

export default AppLayout;
