export const featureOrder = [
  "avgTemperature",
  "avgRainFall",
  "rainOccurRate",
  "sampleCount",
] as const;
export type FeatureKey = (typeof featureOrder)[number];
