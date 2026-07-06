---
name: auth-rbac
description: Work safely on Loopskey authentication, authorization, JWT cookies, OAuth, guards, roles, session refresh, and role-based dashboards. Use when changing auth module code, @Public, @Roles, JwtAuthGuard, RolesGuard, cookies, OAuth redirects, or dashboard route protection.
---

# Auth RBAC

## Workflow

1. Inspect `apps/api/src/modules/auth` and the affected resolver/controller before editing.
2. Remember that `JwtAuthGuard` and `RolesGuard` are global in `AppModule`.
3. Use `@Public()` only when the endpoint must be accessible without a valid session.
4. Use `@Roles(...)` for role-specific API access; align roles with Prisma/GraphQL `Role`.
5. Keep token cookie names, max age, secure, domain, and same-site settings compatible with frontend requests.
6. On the frontend, check guards in `src/components/guards`, dashboard routes, `getDashboardPath`, and OAuth helpers.
7. Preserve `credentials: "include"` in GraphQL requests and refresh-token retry behavior.

## Risk Checklist

- Login, registration, refresh token, logout, and current-user flows still work.
- Public pages do not unexpectedly require auth.
- Protected dashboards reject wrong roles.
- Admin/provider/professional/organization paths route to the right dashboard.
- OAuth redirects match API and frontend environment variables.
- Errors do not leak secrets or token contents.

## Verification

Run targeted API and frontend checks:

```bash
npm run build --workspace api
npm run build --workspace front
```

For behavior changes, add or update focused tests where the repo has a nearby pattern.
