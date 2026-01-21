import { CancellationModel } from "../../../domain/model/valueObjects/CancellationModel";
import { CancellationModelDto } from "../../shared/dtos/CancellationModelDto";

export function mapCancellationModelToDto(
  model: CancellationModel
): CancellationModelDto {
  return {
    date: model.version.toDate(),
    ballParkId: model.ballParkId,
    featureOrder: model.featureOrder,
    coefficients: model.coefficients,
    intercept: model.intercept,
    mean: model.mean,
    std: model.std,
  };
}
