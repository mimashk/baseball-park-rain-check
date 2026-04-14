import { TrainingDatasetRow } from "../dtos/TrainingDatasetRow";
import { TrainingRow } from "../dtos/TrainingRow";

export function mapTrainingDatasetRowToTrainingRow(
  row: TrainingDatasetRow
): TrainingRow {
  return {
    y: row.cancelled,
    x: {
      logAvgRainFall: row.logAvgRainFall,
      rainOccurRate: row.rainOccurRate,
    },
  };
}
