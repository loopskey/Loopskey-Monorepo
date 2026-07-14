import { TGalaxyConfig, TThemeMode } from "@/types/element.types";

const GALAXY_BRAND_HUE = 220;

const GALAXY_BASE_CONFIG: TGalaxyConfig = {
  speed: 0.8,
  starSpeed: 0.4,
  rotation: [1, 0],
  transparent: true,
  focal: [0.5, 0.5],
  rotationSpeed: 0.06,
  repulsionStrength: 2,
  mouseRepulsion: true,
  mouseInteraction: true,
  hueShift: GALAXY_BRAND_HUE,
};

export const GALAXY_THEME_CONFIG: Record<TThemeMode, TGalaxyConfig> = {
  light: {
    ...GALAXY_BASE_CONFIG,
    density: 0.9,
    glowIntensity: 0.2,
    saturation: 0.55,
    twinkleIntensity: 0.25,
  },
  dark: {
    ...GALAXY_BASE_CONFIG,
    density: 1.1,
    glowIntensity: 0.35,
    saturation: 0.45,
    twinkleIntensity: 0.35,
  },
};

export const GALAXY_LAYER_CLASS: Record<TThemeMode, string> = {
  light: "opacity-50 [filter:invert(1)_hue-rotate(180deg)]",
  dark: "opacity-100",
};

export const GALAXY_BACKDROP_CLASS =
  "bg-gradient-to-br from-primary/10 via-transparent to-accent/10 dark:from-primary/25 dark:via-ct-podcast/10 dark:to-accent/20";
