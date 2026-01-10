import { CancellationModelDto } from "../../shared/dtos/CancellationModelDto";
import { FeatureRow } from "../dtos/FeatureRow";

export interface CancellationPredictor {
  predict(params: {
    model: CancellationModelDto;
    features: FeatureRow;
  }): number;
}
