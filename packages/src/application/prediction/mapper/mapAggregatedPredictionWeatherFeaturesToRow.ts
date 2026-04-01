import { FeatureRow } from "../dtos/FeatureRow";
import { AggregatedPredictionWeatherFeatures } from "../../../domain/prediction/valueObjects/AggregatedPredictionWeatherFeatures";

export function mapAggregatedPredictionWeatherFeaturesToRow(
  features: AggregatedPredictionWeatherFeatures
): FeatureRow {
  return {
    avgTemperature: features.avgTemperature.toNumber(),
    avgRainFall: features.avgRainFall.toNumber(),
    rainOccurRate: features.rainOccurRate,
    sampleCount: features.sampleCount,
  };
}
