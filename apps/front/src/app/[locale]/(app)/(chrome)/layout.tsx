import { ReactNode } from "react";

import AppChrome from "@layouts/AppChrome";

const ChromeLayout = ({ children }: { children: ReactNode }) => (
  <AppChrome>{children}</AppChrome>
);

export default ChromeLayout;
