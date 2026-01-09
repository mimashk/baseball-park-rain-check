import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";

export interface UpsertObservedHourlyWeatherRequest {
  ballParkId: BallParkId;
  from: Date;
  to: Date;
}
