import { noindexMetadata } from "@/lib/site/page-metadata";
import { AuthRouteGuard } from "@guards/auth-route-guard";
import { ReactNode } from "react";

export const metadata = noindexMetadata();

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return <AuthRouteGuard>{children}</AuthRouteGuard>;
};

export default AuthLayout;
