import { LucideIcon } from "lucide-react";

import * as API from "@/lib/graphql/generated";

export type TDashboardRole =
  | null
  | string
  | undefined
  | API.Role.Admin
  | API.Role.Provider
  | API.Role.Professional
  | API.Role.Organization;

export type TDashboardNavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};
