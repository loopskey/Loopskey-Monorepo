import {
  ACCESS_TOKEN_COOKIE_DEFAULT,
  PLATFORM_ROLES,
} from "@loopskey/api-contracts/auth";
import { NextRequest, NextResponse } from "next/server";
import { TSessionPayload } from "@/types/guards.types";
import { jwtVerify } from "jose";

/**
 * Must match the name the API writes the cookie under, which is why the default
 * comes from the shared contract rather than a literal on each side.
 */
const ACCESS_TOKEN_COOKIE_NAME =
  process.env.ACCESS_TOKEN_COOKIE_NAME ?? ACCESS_TOKEN_COOKIE_DEFAULT;

/**
 * Routing only. The API re-checks the role on every operation; a user who
 * tampers past this gate still gets refused server-side.
 */
const ROLE_ROUTES = [
  {
    prefix: "/dashboard/professional",
    roles: [PLATFORM_ROLES.PROFESSIONAL],
  },
  {
    prefix: "/dashboard/provider",
    roles: [PLATFORM_ROLES.PROVIDER],
  },
  {
    prefix: "/dashboard/organization",
    roles: [PLATFORM_ROLES.ORGANIZATION],
  },
  {
    prefix: "/dashboard/admin",
    roles: [PLATFORM_ROLES.ADMIN],
  },
] as const;

const AUTH_ROUTES = [
  "/auth/professional",
  "/auth/provider",
  "/auth/organization",
  "/auth/admin",
] as const;

const AUTH_REDIRECT_BY_ROLE = {
  [PLATFORM_ROLES.PROFESSIONAL]: "/dashboard/professional",
  [PLATFORM_ROLES.PROVIDER]: "/dashboard/provider",
  [PLATFORM_ROLES.ORGANIZATION]: "/dashboard/organization",
  [PLATFORM_ROLES.ADMIN]: "/dashboard/admin",
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
