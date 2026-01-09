import { BallParkDailyWeatherForecast } from "../valueObjects/BallParkDailyWeatherForecast";

export interface BallParkDailyWeatherForecastRepository {
  updateMany(
    ballParkDailyWeatherForecasts: BallParkDailyWeatherForecast[]
  ): Promise<void>;
  findAll(): Promise<BallParkDailyWeatherForecast[]>;
}
