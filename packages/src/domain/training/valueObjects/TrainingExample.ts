import { AggregatedTrainingWeatherFeatures } from "./AggregatedTrainingWeatherFeatures";
import { GameCancelled } from "./GameCancelled";

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
}
