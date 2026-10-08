import { getBespokePageMetadata } from "@/utils/static-info-page.utils";
import { ReactNode } from "react";

export const metadata = getBespokePageMetadata("content", "/content");

const ContentLayout = ({ children }: { children: ReactNode }) => children;

export default ContentLayout;
