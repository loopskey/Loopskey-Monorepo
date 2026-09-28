import type { ProfileTaxonomyKind } from "@/lib/graphql/base";
import type { I18nContextValue } from "@/types/providers.types";

export type TTaxonomyTerm = {
  id: string;
  label: string;
  groupKey: string;
  groupLabel: string;
};

export type TTaxonomyCategory = {
  key: string;
  label: string;
  termCount: number;
};

export type TTaxonomyPageStatus = "loading" | "loadingMore" | "ready" | "error";

export type TTaxonomyPage = {
  items: TTaxonomyTerm[];
  totalCount: number;
  nextCursor: string | null;
  status: TTaxonomyPageStatus;
};

export type TRoleChoice =
  | { kind: "canonical"; term: TTaxonomyTerm }
  | { kind: "custom"; label: string };

export type TTaxonomyBrowserOptions = {
  kind: ProfileTaxonomyKind;
  enabled?: boolean;
};

export type TTaxonomyBrowser = ReturnType<
  typeof import("@/hooks/useTaxonomyBrowser").useTaxonomyBrowser
>;

export type TTaxonomyBrowserProps = {
  t: I18nContextValue["t"];
  idPrefix: string;
  browser: TTaxonomyBrowser;
  isSelected: (id: string) => boolean;
  isBlocked?: (id: string) => boolean;
  onPick: (term: TTaxonomyTerm) => void;
  searchLabel: string;
  noResultsText: string;
};

export type TRoleSelectorProps = {
  t: I18nContextValue["t"];
  idPrefix: string;
  value: TRoleChoice | null;
  onChange: (choice: TRoleChoice | null) => void;
  isCollapsible?: boolean;
  isDisabled?: boolean;
};

export type TSkillSuggestionState = {
  items: TTaxonomyTerm[];
  isFallback: boolean;
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
};

export type TSkillSelectorProps = {
  t: I18nContextValue["t"];
  idPrefix: string;
  label: string;
  max: number;
  selected: TTaxonomyTerm[];
  onToggle: (term: TTaxonomyTerm) => void;
  suggestions?: TSkillSuggestionState;
  isDisabled?: boolean;
};
