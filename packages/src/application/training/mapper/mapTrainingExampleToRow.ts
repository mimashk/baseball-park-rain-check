import { TrainingRow } from "../dtos/TrainingRow";
import { TrainingExample } from "../../../domain/training/valueObjects/TrainingExample";
import { buildCancellationFeatures } from "../../shared/utils/buildCancellationFeatures";

export function mapTrainingExampleToRow(example: TrainingExample): TrainingRow {
  const x = buildCancellationFeatures({
    avgRainFall: example.features.avgRainFall.toNumber(),
    rainOccurRate: example.features.rainOccurRate,
  });
  return {
    y: example.label.toNumber(),
    x,
  };
}
