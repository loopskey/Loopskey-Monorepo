import type { Dictionary } from "@/i18n/dictionaries";
import type * as T from "@/types/pages.types";

export type PageKey = keyof Dictionary["staticPages"];

export const STATIC_INFO_EMAIL = "loopskey.dev@gmail.com";

export const EMPTY_STATIC_INFO_PAGE: T.TStaticInfoPageContent = {
  title: "",
  blocks: [],
} as T.TStaticInfoPageContent;

const slugifyHeading = (text: string) =>
  text
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";

const groupBlocks = (
  blocks: T.TStaticInfoBlock[],
): T.TStaticInfoContentBlock[] => {
  const grouped: T.TStaticInfoContentBlock[] = [];
  for (const block of blocks) {
    if (block.type !== "listItem") {
      grouped.push({ type: "paragraph", text: block.text });
      continue;
    }
    const previous = grouped.at(-1);
    if (previous?.type === "list") {
      previous.items.push(block.text);
      continue;
    }
    grouped.push({ type: "list", items: [block.text] });
  }
  return grouped;
};

export const buildStaticInfoOutline = (
  page: T.TStaticInfoPageContent,
): T.TStaticInfoOutline => {
  const lead: T.TStaticInfoBlock[] = [];
  const sections: { title: string; blocks: T.TStaticInfoBlock[] }[] = [];
  for (const block of page.blocks ?? []) {
    if (block.type === "heading") {
      sections.push({ title: block.text, blocks: [] });
      continue;
    }
    const current = sections.at(-1);
    if (current) current.blocks.push(block);
    else lead.push(block);
  }

  const usedIds = new Set<string>();
  const withIds: T.TStaticInfoSection[] = sections.map((section) => {
    const base = `section-${slugifyHeading(section.title)}`;
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) id = `${base}-${suffix++}`;
    usedIds.add(id);
    return { id, title: section.title, blocks: groupBlocks(section.blocks) };
  });
  return {
    title: page.title,
    lead: groupBlocks(lead),
    sections: withIds,
    cta: page.cta,
  };
};
