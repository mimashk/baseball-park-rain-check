import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";

export interface RefreshHourlyWeatherForecastsRequest {
  ballParkId: BallParkId;
  forecastDays: number;
}
