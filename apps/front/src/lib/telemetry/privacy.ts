type PrivacySignals = Navigator & {
  globalPrivacyControl?: boolean;
  doNotTrack?: string | null;
};

export const isTelemetryBuilt = () =>
  process.env.NEXT_PUBLIC_TELEMETRY_ENABLED === "true";

const isSampledIn = () => {
  const rate = Number(process.env.NEXT_PUBLIC_TELEMETRY_VITALS_SAMPLE_RATE);
  return !Number.isFinite(rate) || rate >= 1 || Math.random() < rate;
};

let sampledIn: boolean | undefined;

export const isVitalsSampledIn = () => {
  sampledIn ??= isSampledIn();
  return sampledIn;
};

export const hasOptedOut = () => {
  if (typeof navigator === "undefined") return true;
  const signals = navigator as PrivacySignals;
  return signals.globalPrivacyControl === true || signals.doNotTrack === "1";
};

export const isTelemetryAllowed = () => isTelemetryBuilt() && !hasOptedOut();
