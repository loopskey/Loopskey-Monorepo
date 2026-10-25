"use client";

import { Accordion, AccordionContent } from "@ui/accordion";
import { AccordionItem, AccordionTrigger } from "@ui/accordion";

import type { FaqEntry } from "@/utils/faq-selection";

type LandingFaqAccordionProps = {
  entries: readonly FaqEntry[];
};

const LandingFaqAccordion = ({ entries }: LandingFaqAccordionProps) => (
  <Accordion
    type="single"
    collapsible
    defaultValue={entries[0]?.id}
    className="rounded-2xl border bg-card px-5 shadow-sm sm:px-6"
  >
    {entries.map((entry) => (
      <AccordionItem key={entry.id} value={entry.id}>
        <AccordionTrigger className="min-h-11 items-center py-5 text-base font-semibold text-foreground hover:no-underline">
          {entry.question}
        </AccordionTrigger>
        <AccordionContent className="pb-5 text-sm leading-7 text-muted-foreground sm:text-base">
          {entry.answer}
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export default LandingFaqAccordion;
