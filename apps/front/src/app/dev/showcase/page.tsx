import { DesignShowcase } from "./design-showcase";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Design foundation showcase",
  robots: { index: false, follow: false },
};

const ShowcasePage = () => {
  if (process.env.NEXT_PUBLIC_ENABLE_DESIGN_SHOWCASE !== "true") notFound();
  return <DesignShowcase />;
};

export default ShowcasePage;
