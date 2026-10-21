import {
  isSampledOut,
  sampleRateOf,
} from "@telemetry/utils/telemetry-sampling.util";

describe("telemetry sampling helpers", () => {
  describe("sampleRateOf", () => {
    it("keeps every vital when the setting is absent or blank", () => {
      expect(sampleRateOf(undefined)).toBe(1);
      expect(sampleRateOf("")).toBe(1);
      expect(sampleRateOf("   ")).toBe(1);
    });

    it("reads a fraction as given", () => {
      expect(sampleRateOf("0.25")).toBe(0.25);
      expect(sampleRateOf("0")).toBe(0);
      expect(sampleRateOf("1")).toBe(1);
    });

    it("clamps a rate outside zero to one", () => {
      expect(sampleRateOf("5")).toBe(1);
      expect(sampleRateOf("-2")).toBe(0);
    });

    it("falls back to full collection for something that is not a number", () => {
      expect(sampleRateOf("many")).toBe(1);
      expect(sampleRateOf("NaN")).toBe(1);
      expect(sampleRateOf("Infinity")).toBe(1);
    });
  });

  describe("isSampledOut", () => {
    it("never drops anything at full rate", () => {
      expect(isSampledOut(1, 0)).toBe(false);
      expect(isSampledOut(1, 0.999)).toBe(false);
    });

    it("drops everything at zero rate", () => {
      expect(isSampledOut(0, 0)).toBe(true);
      expect(isSampledOut(0, 0.5)).toBe(true);
    });

    it("keeps a draw below the rate and drops one at or above it", () => {
      expect(isSampledOut(0.5, 0.49)).toBe(false);
      expect(isSampledOut(0.5, 0.5)).toBe(true);
      expect(isSampledOut(0.5, 0.9)).toBe(true);
    });
  });
});
