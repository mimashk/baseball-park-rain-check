import { TrainingRow } from "../dtos/TrainingRow";
import { TrainingExample } from "../../../domain/training/valueObjects/TrainingExample";
import { buildCancellationFeatures } from "../../shared/utils/buildCancellationFeatures";

export function mapTrainingExampleToRow(example: TrainingExample): TrainingRow {
  const x = buildCancellationFeatures({
    avgTemperature: example.features.avgTemperature.toNumber(),
    avgRainFall: example.features.avgRainFall.toNumber(),
    rainOccurRate: example.features.rainOccurRate,
    maxRainFall: example.features.maxRainFall.toNumber(),
    hoursAbove1mm: example.features.hoursAbove1mm,
    hoursAbove3mm: example.features.hoursAbove3mm,
  });
  return {
    y: example.label.toNumber(),
    x,
  };
}
