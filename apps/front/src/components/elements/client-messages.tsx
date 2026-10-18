import { clientMessages, type TClientScope } from "@/i18n/public-messages";
import { MessagesScope } from "@/providers/messages-scope";

import type { PublicLocale } from "@/lib/i18n/locale";
import type { ReactNode } from "react";

type TClientMessagesProps = {
  scope: TClientScope;
  locale: PublicLocale;
  children: ReactNode;
};

export const ClientMessages = ({
  scope,
  locale,
  children,
}: TClientMessagesProps) => (
  <MessagesScope messages={clientMessages(locale, scope)}>
    {children}
  </MessagesScope>
);
