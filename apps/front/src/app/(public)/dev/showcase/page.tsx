import { noindexMetadata } from "@/lib/site/page-metadata";
import { DesignShowcase } from "./design-showcase";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design foundation showcase",
  ...noindexMetadata(),
};

const ShowcasePage = () => {
  if (process.env.NEXT_PUBLIC_ENABLE_DESIGN_SHOWCASE !== "true") notFound();
  return <DesignShowcase />;
};

export default ShowcasePage;
