"use client";

import { DropdownMenuItem, DropdownMenuTrigger } from "@ui/dropdown-menu";
import { DropdownMenu, DropdownMenuContent } from "@ui/dropdown-menu";
import { LanguageLinks } from "@elements/language-links";
import { isDetailPath } from "@/lib/i18n/locale";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

export const LanguageToggleBtn = () => {
  const { language, isRouteLocked, setLanguage, t } = useI18n();
  const pathname = usePathname();

  if (isRouteLocked) {
    if (isDetailPath(pathname)) return null;
    return <LanguageLinks />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" className="rounded-full">
          <Languages className="mr-2 h-4 w-4" />
          {language.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={language === "en"}
          onClick={() => setLanguage("en")}
        >
          {t("common.english")}
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={language === "fr"}
          onClick={() => setLanguage("fr")}
        >
          {t("common.french")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
