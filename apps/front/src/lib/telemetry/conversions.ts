import { TelemetryRegistrationRole } from "@/lib/graphql/base";
import { TelemetryConversionEvent } from "@/lib/graphql/base";
import { TelemetryContentKind } from "@/lib/graphql/base";
import { isTelemetryAllowed } from "@/lib/telemetry/privacy";
import { AuthRegisterRole } from "@/lib/graphql/base";
import { localeOfPathname } from "@/lib/i18n/locale";
import { TelemetryLocale } from "@/lib/graphql/base";
import { ContentType } from "@/lib/graphql/base";

type ConversionRequest = {
  event: TelemetryConversionEvent;
  contentKind?: TelemetryContentKind;
  role?: TelemetryRegistrationRole;
};

const CONTENT_KINDS = new Map<ContentType, TelemetryContentKind>([
  [ContentType.Course, TelemetryContentKind.Course],
  [ContentType.Event, TelemetryContentKind.Event],
  [ContentType.Podcast, TelemetryContentKind.Podcast],
  [ContentType.Youtube, TelemetryContentKind.Youtube],
]);

const REGISTRATION_ROLES = new Map<AuthRegisterRole, TelemetryRegistrationRole>(
  [
    [AuthRegisterRole.Professional, TelemetryRegistrationRole.Professional],
    [AuthRegisterRole.Provider, TelemetryRegistrationRole.Provider],
  ],
);

export const telemetryKindOf = (contentType: ContentType) =>
  CONTENT_KINDS.get(contentType) ?? TelemetryContentKind.None;

export const telemetryRoleOf = (role: AuthRegisterRole) =>
  REGISTRATION_ROLES.get(role) ?? TelemetryRegistrationRole.None;

export const trackConversion = (request: ConversionRequest) => {
  if (!isTelemetryAllowed()) return;
  void Promise.all([
    import("@/lib/telemetry/sender"),
    import("@/lib/telemetry/attribution"),
  ])
    .then(([sender, attribution]) =>
      sender.enqueueConversion({
        id: sender.newEventId(),
        event: request.event,
        contentKind: request.contentKind ?? TelemetryContentKind.None,
        role: request.role ?? TelemetryRegistrationRole.None,
        attribution: attribution.landingAttribution(),
        locale:
          localeOfPathname(window.location.pathname) === "fr"
            ? TelemetryLocale.Fr
            : TelemetryLocale.En,
      }),
    )
    .catch(() => undefined);
};
