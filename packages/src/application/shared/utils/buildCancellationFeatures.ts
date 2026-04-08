export interface BuildCancellationFeaturesInput {
  avgTemperature: number;
  avgRainFall: number;
  rainOccurRate: number;
  maxRainFall: number;
  hoursAbove1mm: number;
  hoursAbove3mm: number;
}

export function buildCancellationFeatures(
  input: BuildCancellationFeaturesInput
) {
  return {
    avgTemperature: input.avgTemperature,
    logAvgRainFall: Math.log1p(input.avgRainFall),
    rainOccurRate: input.rainOccurRate,
    maxRainFall: input.maxRainFall,
    hoursAbove1mm: input.hoursAbove1mm,
    hoursAbove3mm: input.hoursAbove3mm,
  };
}
