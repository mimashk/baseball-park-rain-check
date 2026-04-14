export interface BuildCancellationFeaturesInput {
  avgRainFall: number;
  rainOccurRate: number;
}

export function buildCancellationFeatures(
  input: BuildCancellationFeaturesInput
) {
  return {
    logAvgRainFall: Math.log1p(input.avgRainFall),
    rainOccurRate: input.rainOccurRate,
  };
}
