export const featureOrder = [
  "avgTemperature",
  "avgRainFall",
  "rainOccurRate",
] as const;
export type FeatureKey = (typeof featureOrder)[number];
