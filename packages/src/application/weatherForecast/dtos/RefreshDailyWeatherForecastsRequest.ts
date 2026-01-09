import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";

export interface RefreshDailyWeatherForecastsRequest {
  ballParkId: BallParkId;
  forecastDays: number;
}
