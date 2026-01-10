import { ValidationError } from "../../../shared/errors/ValidationError";
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
    if (!props.label) {
      throw new ValidationError("ラベルは必須です", { label: props.label });
    }
    if (!props.features) {
      throw new ValidationError("気象データは必須です", {
        features: props.features,
      });
    }
    return new TrainingExample(props.label, props.features);
  }
}
