export const featureOrder = [
  "avgTemperature",
  "logAvgRainFall",
  "rainOccurRate",
  "maxRainFall",
  "hoursAbove1mm",
  "hoursAbove3mm",
] as const;
export type FeatureKey = (typeof featureOrder)[number];
