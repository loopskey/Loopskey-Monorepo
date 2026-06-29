"use client";

import { useMounted } from "@/hooks/useMounted";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@ui/button";

export const ThemeToggleBtn = () => {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  if (!mounted) {
    return (
      <Button
        size="icon"
        variant="cancel"
        className="rounded-full"
        aria-label="Toggle theme"
        onClick={(event) => event.preventDefault()}
      >
        <span className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      size="icon"
      variant="outline"
      className="rounded-full"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};
