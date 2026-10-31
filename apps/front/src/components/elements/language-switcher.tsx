"use client";

import { DropdownMenuItem, DropdownMenuTrigger } from "@ui/dropdown-menu";
import { DropdownMenu, DropdownMenuContent } from "@ui/dropdown-menu";
import { LanguageIconButton } from "@elements/language-icon-button";
import { PublicLanguageMenu } from "@elements/public-language-menu";
import { useI18n } from "@/hooks/useI18n";
import { Check } from "lucide-react";

const LANGUAGES = [
  { code: "en", nameKey: "common.english" },
  { code: "fr", nameKey: "common.french" },
] as const;

export const LanguageToggleBtn = () => {
  const { language, isRouteLocked, setLanguage, t } = useI18n();

  if (isRouteLocked) return <PublicLanguageMenu />;

  const current = LANGUAGES.find((entry) => entry.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <LanguageIconButton
          code={language}
          aria-label={t("common.languageSwitcher.current", {
            name: t(current?.nameKey ?? "common.english"),
          })}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-44 rounded-xl p-1.5">
        {LANGUAGES.map(({ code, nameKey }) => (
          <DropdownMenuItem
            key={code}
            lang={code}
            className="gap-2"
            aria-current={code === language ? "true" : undefined}
            onClick={() => code !== language && setLanguage(code)}
          >
            {code === language ? (
              <Check aria-hidden className="size-4 shrink-0 text-primary" />
            ) : (
              <span aria-hidden className="size-4 shrink-0" />
            )}
            {t(nameKey)}
            <span className="ml-auto text-[11px] font-bold text-muted-foreground">
              {code.toUpperCase()}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
