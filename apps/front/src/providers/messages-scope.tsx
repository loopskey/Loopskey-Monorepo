"use client";

import { createTranslator, getByKey } from "@/lib/i18n/translator";
import { I18nContext } from "@/providers/language-provider";
import { useMemo } from "react";
import { useI18n } from "@/hooks/useI18n";

import type { ReactNode } from "react";

type TMessagesScopeProps = {
  children: ReactNode;
  messages: Record<string, unknown>;
};

export const MessagesScope = ({ children, messages }: TMessagesScopeProps) => {
  const parent = useI18n();

  const value = useMemo(
    () => ({
      ...parent,
      ...createTranslator((key) => {
        const own = getByKey(messages, key);
        return own === undefined ? parent.traw(key) : own;
      }),
    }),
    [parent, messages],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
