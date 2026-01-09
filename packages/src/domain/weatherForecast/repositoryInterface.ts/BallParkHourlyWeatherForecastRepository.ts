import { BallParkHourlyWeatherForecast } from "../valueObjects/BallParkHourlyWeatherForecast";

export interface BallParkHourlyWeatherForecastRepository {
  updateMany(
    ballParkHourlyWeatherForecasts: BallParkHourlyWeatherForecast[]
  ): Promise<void>;
  findAll(): Promise<BallParkHourlyWeatherForecast[]>;
  findByDateAndBallPark(
    from: Date,
    to: Date,
    ballParkId: number
  ): Promise<BallParkHourlyWeatherForecast[]>;
}
