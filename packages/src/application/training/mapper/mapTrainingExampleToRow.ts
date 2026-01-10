import { TrainingRow } from "../dtos/TrainingRow";
import { TrainingExample } from "../../../domain/training/valueObjects/TrainingExample";

export function mapTrainingExampleToRow(example: TrainingExample): TrainingRow {
  const x = {
    avgTemperature: example.features.avgTemperature.toNumber(),
    avgRainFall: example.features.avgRainFall.toNumber(),
    rainOccurRate: example.features.rainOccurRate,
    sampleCount: example.features.sampleCount,
  };
  return {
    y: example.label.toNumber(),
    x,
  };
}
