"use client";

import { defaultOpenItemId, normalizeText } from "@/utils/constant";
import { faqCategories, isFaqItemArray } from "@/utils/function-helper";
import { TFaqCategoryKey, TFaqItem } from "@/types/hooks.types";
import { useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";

export const useFaqPage = () => {
  const { t, traw } = useI18n();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<TFaqCategoryKey>("ALL");
  const [openItemId, setOpenItemId] = useState<string | null>(
    defaultOpenItemId,
  );

  const categories = useMemo(() => faqCategories, []);

  const faqs = useMemo<TFaqItem[]>(() => {
    const items = traw<unknown>("faqPage.items", []);
    return isFaqItemArray(items) ? items : [];
  }, [traw]);

  console.log("faq", faqs);

  const filteredFaqs = useMemo(() => {
    const query = normalizeText(search);
    return faqs.filter((item) => {
      const matchesCategory =
        activeCategory === "ALL" || item.category === activeCategory;
      const searchableText = normalizeText(
        `${item.question} ${item.answer} ${item.category}`,
      );
      const matchesSearch = !query || searchableText.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, search]);

  const categoryCounts = useMemo(() => {
    return categories.reduce<Record<TFaqCategoryKey, number>>(
      (acc, category) => {
        if (category === "ALL") {
          acc.ALL = faqs.length;
          return acc;
        }
        acc[category] = faqs.filter(
          (item) => item.category === category,
        ).length;
        return acc;
      },
      {
        AI: 0,
        ALL: 0,
        CPD: 0,
        SECURITY: 0,
        PLATFORM: 0,
        PROVIDERS: 0,
        ORGANIZATIONS: 0,
        CERTIFICATIONS: 0,
      },
    );
  }, [categories, faqs]);

  const resetFilters = () => {
    setSearch("");
    setActiveCategory("ALL");
    setOpenItemId(defaultOpenItemId);
  };

  const toggleItem = (id: string) =>
    setOpenItemId((current) => (current === id ? null : id));

  const hasActiveFilters = search.trim().length > 0 || activeCategory !== "ALL";

  return {
    t,
    faqs,
    search,
    setSearch,
    categories,
    openItemId,
    toggleItem,
    resetFilters,
    filteredFaqs,
    activeCategory,
    categoryCounts,
    hasActiveFilters,
    setActiveCategory,
  };
};
