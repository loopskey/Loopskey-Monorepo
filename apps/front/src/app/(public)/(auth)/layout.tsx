import { AuthRouteGuard } from "@guards/auth-route-guard";
import { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return <AuthRouteGuard>{children}</AuthRouteGuard>;
};

export default AuthLayout;
