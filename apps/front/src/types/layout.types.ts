import { TSolutionLink } from "@/types/element.types";

export type TStartMenu = {
  className?: string;
  links: TSolutionLink[];
  onNavigate?: () => void;
};
