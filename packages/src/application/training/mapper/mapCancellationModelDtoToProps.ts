import { CancellationModelDto } from "../../shared/dtos/CancellationModelDto";
import { CancellationModelProps } from "../../../domain/model/valueObjects/CancellationModel";
import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";

export function mapCancellationModelDtoToProps(
  model: CancellationModelDto
): CancellationModelProps {
  return {
    date: model.date,
    ballParkId: model.ballParkId as BallParkId,
    featureOrder: model.featureOrder,
    coefficients: model.coefficients,
    intercept: model.intercept,
    mean: model.mean,
    std: model.std,
  };
}
