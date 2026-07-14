import { TNeatGradientMode } from "@/types/element.types";
import { NeatConfig } from "@firecms/neat";

const NEAT_LIGHT_COLORS = {
  primaryTint: "#B0D4FF", // oklch(0.86 0.075 255)
  secondary: "#D2ECFC", // --secondary
  accent: "#9CE8E2", // --accent
  podcastTint: "#D8C7F9", // oklch(0.86 0.07 300)
  premium: "#CD9C1F", // --premium
  primary: "#006EDC", // --primary
  background: "#F2FCFF", // --background
} as const;

const NEAT_DARK_COLORS = {
  primary: "#239CFF", // --primary
  primaryDeep: "#0049A1", // oklch(0.42 0.16 255)
  accent: "#009C96", // --accent
  podcastDeep: "#5B3291", // oklch(0.42 0.15 300)
  premium: "#EEBC4A", // --premium
  ring: "#49A9FF", // --ring
  background: "#010A1A", // --background
} as const;

type TNeatThemeConfig = Pick<
  NeatConfig,
  | "colors"
  | "backgroundColor"
  | "fresnelColor"
  | "colorBrightness"
  | "colorSaturation"
>;

export const NEAT_GRADIENT_BASE_CONFIG: Omit<NeatConfig, "colors"> = {
  speed: 4.5,
  horizontalPressure: 6,
  verticalPressure: 6,
  waveFrequencyX: 3,
  waveFrequencyY: 3,
  waveAmplitude: 3,
  shadows: 2,
  highlights: 3,
  wireframe: true,
  colorBlending: 6,
  backgroundAlpha: 1,
  grainScale: 0,
  grainSparsity: 0,
  grainIntensity: 0,
  grainSpeed: 0,
  resolution: 0.4,
  yOffset: -0.29998779296875,
  yOffsetWaveMultiplier: 10.9,
  yOffsetColorMultiplier: 3.8,
  yOffsetFlowMultiplier: 6.2,
  flowDistortionA: 2.8,
  flowDistortionB: 2.4,
  flowScale: 1.5,
  flowEase: 0.41,
  flowEnabled: false,
  enableProceduralTexture: false,
  transparentTextureVoid: false,
  domainWarpEnabled: false,
  domainWarpIntensity: 0,
  domainWarpScale: 3,
  vignetteIntensity: 0.3,
  vignetteRadius: 0.6,
  fresnelEnabled: true,
  fresnelPower: 2,
  fresnelIntensity: 0.2,
  iridescenceEnabled: false,
  iridescenceIntensity: 0.8,
  iridescenceSpeed: 1,
  bloomIntensity: 0.4,
  bloomThreshold: 0.7,
  chromaticAberration: 9,
  shapeType: "plane",
  shapeRotationX: 0,
  shapeRotationY: 0,
  shapeRotationZ: 0,
  shapeAutoRotateSpeedX: 0,
  shapeAutoRotateSpeedY: 0,
  planeBend: 0,
  planeTwist: 0,
  silhouetteFade: 0.25,
  flatShading: true,
  cameraLock: true,
  cameraX: 0,
  cameraY: 0,
  cameraZ: 0,
  cameraRotationX: 0,
  cameraRotationY: 0,
  cameraRotationZ: 0,
  cameraZoom: 1,
};

export const NEAT_GRADIENT_THEME_CONFIG: Record<
  TNeatGradientMode,
  TNeatThemeConfig
> = {
  light: {
    colors: [
      { color: NEAT_LIGHT_COLORS.primaryTint, enabled: true },
      { color: NEAT_LIGHT_COLORS.secondary, enabled: true },
      { color: NEAT_LIGHT_COLORS.accent, enabled: true },
      { color: NEAT_LIGHT_COLORS.podcastTint, enabled: true },
      { color: NEAT_LIGHT_COLORS.premium, enabled: false },
    ],
    backgroundColor: NEAT_LIGHT_COLORS.background,
    fresnelColor: NEAT_LIGHT_COLORS.primary,
    colorBrightness: 1,
    colorSaturation: -4,
  },
  dark: {
    colors: [
      { color: NEAT_DARK_COLORS.primaryDeep, enabled: true },
      { color: NEAT_DARK_COLORS.primary, enabled: true },
      { color: NEAT_DARK_COLORS.accent, enabled: true },
      { color: NEAT_DARK_COLORS.podcastDeep, enabled: true },
      { color: NEAT_DARK_COLORS.premium, enabled: false },
    ],
    backgroundColor: NEAT_DARK_COLORS.background,
    fresnelColor: NEAT_DARK_COLORS.ring,
    colorBrightness: 0.82,
    colorSaturation: -2,
  },
};
