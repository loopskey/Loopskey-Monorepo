import { NextRequest, NextResponse } from "next/server";
import { TSessionPayload } from "@/types/guards.types";
import { jwtVerify } from "jose";

const ACCESS_TOKEN_COOKIE_NAME =
  process.env.ACCESS_TOKEN_COOKIE_NAME ?? "access_token";

const ROLE_ROUTES = [
  {
    prefix: "/dashboard/professional",
    roles: ["PROFESSIONAL"],
  },
  {
    prefix: "/dashboard/provider",
    roles: ["PROVIDER"],
  },
  {
    prefix: "/dashboard/organization",
    roles: ["ORGANIZATION"],
  },
  {
    prefix: "/dashboard/admin",
    roles: ["ADMIN"],
  },
] as const;

const AUTH_ROUTES = [
  "/auth/professional",
  "/auth/provider",
  "/auth/organization",
  "/auth/admin",
] as const;

const AUTH_REDIRECT_BY_ROLE = {
  PROFESSIONAL: "/dashboard/professional",
  PROVIDER: "/dashboard/provider",
  ORGANIZATION: "/dashboard/organization",
  ADMIN: "/dashboard/admin",
} as const;

const getJwtAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
};

const verifySession = async (
  token?: string,
): Promise<TSessionPayload | null> => {
  if (!token) return null;
  const secret = getJwtAccessSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: typeof payload.sub === "string" ? payload.sub : undefined,
      role: typeof payload.role === "string" ? payload.role : undefined,
    };
  } catch {
    return null;
  }
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const session = await verifySession(token);

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    if (session?.sub && session.role) {
      const dashboardPath =
        AUTH_REDIRECT_BY_ROLE[
          session.role as keyof typeof AUTH_REDIRECT_BY_ROLE
        ];

      if (dashboardPath) {
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    }

    return NextResponse.next();
  }

  const matchedRoute = ROLE_ROUTES.find((route) => {
    return pathname.startsWith(route.prefix);
  });

  if (!matchedRoute) return NextResponse.next();

  if (!session?.sub) {
    const loginUrl = new URL("/auth/professional", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!session.role || !matchedRoute.roles.includes(session.role as never)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/admin/:path*",
    "/auth/provider/:path*",
    "/auth/professional/:path*",
    "/auth/organization/:path*",
    "/dashboard/admin/:path*",
    "/dashboard/provider/:path*",
    "/dashboard/professional/:path*",
    "/dashboard/organization/:path*",
  ],
};
