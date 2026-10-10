import { bespokePageMetadata } from "@/utils/static-info-page.utils";
import { ReactNode } from "react";

export const generateMetadata = bespokePageMetadata(
  "servicesPage",
  "/services",
);

const ServicesLayout = ({ children }: { children: ReactNode }) => children;

export default ServicesLayout;
