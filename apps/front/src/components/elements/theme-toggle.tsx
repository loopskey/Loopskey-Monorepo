"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useI18n } from "@hooks/useI18n";
import { Button } from "@ui/button";

export const ThemeToggle = () => {
  const { t } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        type="button"
        size="icon"
        variant="outline"
        radius="full"
        aria-hidden="true"
        tabIndex={-1}
        disabled
      >
        <Sun className="h-4 w-4 opacity-0" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";
  const nextLabel = isDark
    ? t("theme.switchToLight", undefined, "Switch to light mode")
    : t("theme.switchToDark", undefined, "Switch to dark mode");
  const tooltip = isDark
    ? t("theme.light", undefined, "Light mode")
    : t("theme.dark", undefined, "Dark mode");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          type="button"
          radius="full"
          variant="outline"
          title={nextLabel}
          aria-label={nextLabel}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
};
