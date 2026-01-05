import { AggregatedTrainingWeatherFeatures } from "./AggregatedTrainingWeatherFeatures";
import { GameCancelled } from "./GameCancelled";
import { TrainingKey } from "./TrainingKey";
import { TrainingRow } from "../dtos/TrainingRow";

export interface TrainingExampleProps {
  key: TrainingKey;
  label: GameCancelled;
  features: AggregatedTrainingWeatherFeatures;
}

export class TrainingExample {
  private constructor(
    readonly key: TrainingKey,
    readonly label: GameCancelled,
    readonly features: AggregatedTrainingWeatherFeatures
  ) {}
  static create(props: TrainingExampleProps): TrainingExample {
    if (!props.key) throw new Error("トレーニングキーは必須です");
    if (!props.label) throw new Error("ラベルは必須です");
    if (!props.features) throw new Error("気象データは必須です");
    return new TrainingExample(props.key, props.label, props.features);
  }

  toPrimitive(): TrainingRow {
    const x = {
      avgTemperature: this.features.avgTemperature.toNumber(),
      avgRainFall: this.features.avgRainFall.toNumber(),
      rainOccurRate: this.features.rainOccurRate,
      sampleCount: this.features.sampleCount,
    };
    return {
      id: this.key.toString(),
      y: this.label.toNumber(),
      x,
    };
  }
}
