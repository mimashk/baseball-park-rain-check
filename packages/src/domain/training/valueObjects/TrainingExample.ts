import { AggregatedTrainingWeatherFeatures } from "./AggregatedTrainingWeatherFeatures";
import { GameCancelled } from "./GameCancelled";
import { TrainingRow } from "../dtos/TrainingRow";

export interface TrainingExampleProps {
  label: GameCancelled;
  features: AggregatedTrainingWeatherFeatures;
}

export class TrainingExample {
  private constructor(
    readonly label: GameCancelled,
    readonly features: AggregatedTrainingWeatherFeatures
  ) {}
  static create(props: TrainingExampleProps): TrainingExample {
    if (!props.label) throw new Error("ラベルは必須です");
    if (!props.features) throw new Error("気象データは必須です");
    return new TrainingExample(props.label, props.features);
  }

  toPrimitive(): TrainingRow {
    const x = {
      avgTemperature: this.features.avgTemperature.toNumber(),
      avgRainFall: this.features.avgRainFall.toNumber(),
      rainOccurRate: this.features.rainOccurRate,
      sampleCount: this.features.sampleCount,
    };
    return {
      y: this.label.toNumber(),
      x,
    };
  }
}
