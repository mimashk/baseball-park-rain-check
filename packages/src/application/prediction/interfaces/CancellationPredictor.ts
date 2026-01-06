import { CancellationModelDto } from "../../../domain/model/dtos/CancellationModelDto";
import { FeatureRow } from "../../../domain/prediction/dtos/FeatureRow";

export interface CancellationPredictor {
  predict(params: {
    model: CancellationModelDto;
    features: FeatureRow;
  }): number;
}
