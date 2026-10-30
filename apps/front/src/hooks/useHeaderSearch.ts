"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HERO_SEARCH_MIN_LENGTH } from "@utils/landing-public.constant";
import { SEARCH_DEBOUNCE_MS } from "@utils/landing-public.constant";
import { useDebouncedValue } from "@hooks/useDebounced";
import { useI18n } from "@hooks/useI18n";

import type { THeaderSearchItem } from "@/lib/search/catalog-search";

export const HEADER_SEARCH_MIN_LENGTH = HERO_SEARCH_MIN_LENGTH;

const RESULT_TAKE = 6;
const RECENT_LIMIT = 5;
const RECENT_STORAGE_KEY = "loopskey:recent-searches";

type TSearchState = {
  items: THeaderSearchItem[];
  status: "idle" | "loading" | "ready" | "error";
};

const IDLE: TSearchState = { status: "idle", items: [] };

const readRecent = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(RECENT_STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
};

const writeRecent = (values: string[]) => {
  try {
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Recent searches are a convenience; storage can be blocked or full.
  }
};

export const useHeaderSearch = () => {
  const { t } = useI18n();

  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [state, setState] = useState<TSearchState>(IDLE);

  const term = query.trim();
  const debouncedTerm = useDebouncedValue(term, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  useEffect(() => {
    if (debouncedTerm.length < HEADER_SEARCH_MIN_LENGTH) {
      setState(IDLE);
      return;
    }

    const controller = new AbortController();
    setState((current) => ({ ...current, status: "loading" }));

    import("@/lib/search/catalog-search")
      .then(({ searchCatalog }) =>
        searchCatalog(t, debouncedTerm, RESULT_TAKE, controller.signal),
      )
      .then((items) => {
        if (!controller.signal.aborted) setState({ status: "ready", items });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error", items: [] });
      });

    return () => controller.abort();
  }, [debouncedTerm, t]);

  const remember = useCallback((value: string) => {
    const next = value.trim();
    if (next.length < HEADER_SEARCH_MIN_LENGTH) return;
    setRecent((current) => {
      const updated = [
        next,
        ...current.filter((entry) => entry.toLowerCase() !== next.toLowerCase()),
      ].slice(0, RECENT_LIMIT);
      writeRecent(updated);
      return updated;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    writeRecent([]);
  }, []);

  // A result list is only trustworthy while it belongs to the text on screen.
  const isCurrent = term.length >= HEADER_SEARCH_MIN_LENGTH && term === debouncedTerm;
  const view = useMemo(
    () => ({
      status:
        term.length < HEADER_SEARCH_MIN_LENGTH
          ? ("idle" as const)
          : isCurrent
            ? state.status
            : ("loading" as const),
      items: term.length < HEADER_SEARCH_MIN_LENGTH ? [] : state.items,
    }),
    [term, isCurrent, state],
  );

  return {
    term,
    query,
    recent,
    setQuery,
    remember,
    clearRecent,
    status: view.status,
    items: view.items,
  };
};
