import { FeatureRow } from "../dtos/FeatureRow";
import { AggregatedPredictionWeatherFeatures } from "../../../domain/prediction/valueObjects/AggregatedPredictionWeatherFeatures";
import { buildCancellationFeatures } from "../../shared/utils/buildCancellationFeatures";

export function mapAggregatedPredictionWeatherFeaturesToRow(
  features: AggregatedPredictionWeatherFeatures
): FeatureRow {
  return buildCancellationFeatures({
    avgRainFall: features.avgRainFall.toNumber(),
    rainOccurRate: features.rainOccurRate,
  });
}
