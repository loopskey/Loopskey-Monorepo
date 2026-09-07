import { TGalaxyConfig } from "@/types/element.types";

const GALAXY_BRAND_HUE = 220;

export const GALAXY_CONFIG: TGalaxyConfig = {
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
  density: 0.9,
  glowIntensity: 0.2,
  saturation: 0.55,
  twinkleIntensity: 0.25,
};

export const GALAXY_LAYER_CLASS =
  "opacity-50 [filter:invert(1)_hue-rotate(180deg)]";

export const GALAXY_BACKDROP_CLASS =
  "bg-gradient-to-br from-primary/10 via-transparent to-accent/10";
