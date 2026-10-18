import { CurrentUserDocument } from "@/lib/graphql/operations/session";
import { executeWithRefresh } from "@/lib/graphql/request";
import { LogoutDocument } from "@/lib/graphql/operations/session";

import type { CurrentUserQuery } from "@/lib/graphql/operations/session";

export type TPublicSessionUser = NonNullable<
  CurrentUserQuery["currentUser"]["user"]
>;

export type TPublicSession = {
  status: "idle" | "loading" | "ready";
  user: TPublicSessionUser | null;
};

const IDLE: TPublicSession = { status: "idle", user: null };

let session: TPublicSession = IDLE;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

const publish = (next: TPublicSession) => {
  session = next;
  listeners.forEach((listener) => listener());
};

export const subscribePublicSession = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const readPublicSession = () => session;

export const readServerPublicSession = () => IDLE;

export const refreshPublicSession = () => {
  if (inflight) return inflight;
  publish({ status: "loading", user: session.user });
  inflight = executeWithRefresh({ document: CurrentUserDocument })
    .then((result) => {
      const payload =
        "data" in result
          ? (result.data as CurrentUserQuery).currentUser
          : undefined;
      publish({ status: "ready", user: payload?.user ?? null });
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
};

export const signOutPublicSession = async () => {
  const result = await executeWithRefresh({ document: LogoutDocument });
  if ("error" in result) throw new Error(result.error.message);
  publish({ status: "ready", user: null });
  const [{ store }, { baseApi }] = await Promise.all([
    import("@/lib/rtk/store"),
    import("@/lib/rtk/baseApi"),
  ]);
  store.dispatch(baseApi.util.resetApiState());
};
