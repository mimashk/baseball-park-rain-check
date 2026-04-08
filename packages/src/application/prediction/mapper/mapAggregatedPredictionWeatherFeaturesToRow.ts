import { FeatureRow } from "../dtos/FeatureRow";
import { AggregatedPredictionWeatherFeatures } from "../../../domain/prediction/valueObjects/AggregatedPredictionWeatherFeatures";
import { buildCancellationFeatures } from "../../shared/utils/buildCancellationFeatures";

export function mapAggregatedPredictionWeatherFeaturesToRow(
  features: AggregatedPredictionWeatherFeatures
): FeatureRow {
  return {
    ...buildCancellationFeatures({
      avgTemperature: features.avgTemperature.toNumber(),
      avgRainFall: features.avgRainFall.toNumber(),
      rainOccurRate: features.rainOccurRate,
      maxRainFall: features.maxRainFall.toNumber(),
      hoursAbove1mm: features.hoursAbove1mm,
      hoursAbove3mm: features.hoursAbove3mm,
    }),
    sampleCount: features.sampleCount,
  };
}
