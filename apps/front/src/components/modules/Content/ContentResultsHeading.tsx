"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";

const ContentResultsHeading = () => {
  const { t } = useI18n();
  const location = useSearchParams().toString();
  const previousLocation = useRef(location);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (previousLocation.current === location) return;
    previousLocation.current = location;
    heading.current?.focus();
  }, [location]);

  return (
    <h2
      tabIndex={-1}
      ref={heading}
      id="catalog-results-heading"
      className="sr-only outline-none"
    >
      {t("content.results.heading")}
    </h2>
  );
};

export default ContentResultsHeading;
