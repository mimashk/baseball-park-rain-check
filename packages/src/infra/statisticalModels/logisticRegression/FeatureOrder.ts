export const featureOrder = ["logAvgRainFall", "rainOccurRate"] as const;
export type FeatureKey = (typeof featureOrder)[number];
