import { CancellationModel } from "../../../domain/model/valueObjects/CancellationModel";
import { CancellationModelDto } from "../../shared/dtos/CancellationModelDto";

export function mapCancellationModelToDto(
  model: CancellationModel
): CancellationModelDto {
  return {
    date: model.version.toDate(),
    featureOrder: model.featureOrder,
    coefficients: model.coefficients,
    intercept: model.intercept,
    mean: model.mean,
    std: model.std,
  };
}
