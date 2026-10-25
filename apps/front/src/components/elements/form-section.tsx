"use client";

import { TFormSectionProps } from "@/types/element.types";
import { useId } from "react";

export const FormSection = ({ title, children }: TFormSectionProps) => {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <h3 id={headingId} className="text-sm font-semibold">
        {title}
      </h3>

      {children}
    </section>
  );
};
