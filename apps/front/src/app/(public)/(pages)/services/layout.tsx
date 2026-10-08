import { getBespokePageMetadata } from "@/utils/static-info-page.utils";
import { ReactNode } from "react";

export const metadata = getBespokePageMetadata("servicesPage", "/services");

const ServicesLayout = ({ children }: { children: ReactNode }) => children;

export default ServicesLayout;
