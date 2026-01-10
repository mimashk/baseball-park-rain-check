import { CancellationModelDto } from "../../shared/dtos/CancellationModelDto";
import { CancellationModelProps } from "../../../domain/model/valueObjects/CancellationModel";

export function mapCancellationModelDtoToProps(
  model: CancellationModelDto
): CancellationModelProps {
  return {
    date: model.date,
    featureOrder: model.featureOrder,
    coefficients: model.coefficients,
    intercept: model.intercept,
    mean: model.mean,
    std: model.std,
  };
}
