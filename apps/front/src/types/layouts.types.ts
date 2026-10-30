import type { TNavItem } from "./element.types";
import type { THeaderSearchVariant } from "./element.types";
import type { TPublicSessionUser } from "@/lib/session/public-session";
import type { THeaderSearchItem } from "@/lib/search/catalog-search";
import type { I18nContextValue } from "./providers.types";

export type THeaderSearchPanelProps = {
  term: string;
  listId: string;
  recent: string[];
  hasError: boolean;
  isLoading: boolean;
  activeIndex: number;
  t: I18nContextValue["t"];
  onClearRecent: () => void;
  items: THeaderSearchItem[];
  variant: THeaderSearchVariant;
  onPick: (query?: string) => void;
};

export type TLogoProps = {
  label?: string;
  className?: string;
  variant?: "default" | "onPrimary";
};

export type TPublicUserMenuProps = {
  onNavigate?: () => void;
  variant?: TUserMenuVariant;
};

export type TRoleStripProps = {
  workspace?: {
    roleLabelKey: string;
    dashboardHref: string;
  };
};

export type TUserMenuVariant = "dropdown" | "inline";

export type TUserMenuViewProps = {
  onLogout: () => void;
  isLoggingOut: boolean;
  onNavigate?: () => void;
  user: TPublicSessionUser;
  variant?: TUserMenuVariant;
};

export type TUserMenuProps = {
  onNavigate?: () => void;
  variant?: TUserMenuVariant;
};

export type THeaderMobileMenuProps = {
  id: string;
  isOpen: boolean;
  joinHref: string;
  showJoin: boolean;
  joinLabel: string;
  onClose: () => void;
  navItems: TNavItem[];
  onDismiss: () => void;
  showRoleMenu: boolean;
  isActive: (href: string) => boolean;
};
