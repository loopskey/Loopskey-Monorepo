"use client";

import { ReactNode } from "react";

const AuthPageShell = ({ children }: { children: ReactNode }) => {
  return <main className=" px-4 py-10 sm:px-6 lg:px-8">{children}</main>;
};

export default AuthPageShell;
