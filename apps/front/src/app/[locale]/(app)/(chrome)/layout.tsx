import { ReactNode } from "react";

import PublicChrome from "@layouts/PublicChrome";

const ChromeLayout = ({ children }: { children: ReactNode }) => (
  <PublicChrome>{children}</PublicChrome>
);

export default ChromeLayout;
