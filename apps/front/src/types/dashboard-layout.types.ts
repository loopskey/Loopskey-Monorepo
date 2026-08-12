import type { LucideIcon } from "lucide-react";
import type { Role } from "@/lib/graphql/base";

export type TDashboardRole =
  | null
  | string
  | undefined
  | Role.Admin
  | Role.Provider
  | Role.Professional
  | Role.Organization;

export type TDashboardNavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};
