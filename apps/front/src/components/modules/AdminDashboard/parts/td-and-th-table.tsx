import { ReactNode } from "react";

export const Th = ({ children }: { children: ReactNode }) => (
  <th className="px-5 py-4 font-medium text-muted-foreground">{children}</th>
);

export const Td = ({ children }: { children: ReactNode }) => (
  <td className="px-5 py-4 align-middle">{children}</td>
);
