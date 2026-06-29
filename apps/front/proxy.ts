import { ROLE_ROUTES, SESSION_COOKIE_NAME } from "@/utils/constant";
import { NextRequest, NextResponse } from "next/server";
import { getSessionSecret } from "@/utils/function-helper";
import { TSessionPayload } from "@/types/guards.types";
import { jwtVerify } from "jose";

const verifySession = async (
  token?: string,
): Promise<TSessionPayload | null> => {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
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
  const matchedRoute = ROLE_ROUTES.find((route) => {
    return pathname.startsWith(route.prefix);
  });

  if (!matchedRoute) return NextResponse.next();
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);
  if (!session?.sub) {
    const loginUrl = new URL("/auth/professional", request.url);
    loginUrl.searchParams?.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (!session.role || !matchedRoute.roles.includes(session.role as never))
    return NextResponse.redirect(new URL("/", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/professional/:path*",
    "/dashboard/provider/:path*",
    "/dashboard/organization/:path*",
    "/dashboard/admin/:path*",
  ],
};
