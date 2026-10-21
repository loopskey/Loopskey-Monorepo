const FULL_RATE = 1;

export const sampleRateOf = (raw: string | undefined) => {
  if (raw === undefined || raw.trim() === "") return FULL_RATE;
  const rate = Number(raw);
  return Number.isFinite(rate)
    ? Math.min(FULL_RATE, Math.max(0, rate))
    : FULL_RATE;
};

export const isSampledOut = (rate: number, draw: number) =>
  rate < FULL_RATE && draw >= rate;
