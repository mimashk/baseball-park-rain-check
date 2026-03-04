import { TransactionContext } from "../../shared/interfaces/TransactionContext";
import { BallParkDailyWeatherForecast } from "../valueObjects/BallParkDailyWeatherForecast";

export interface BallParkDailyWeatherForecastRepository {
  updateMany(
    ballParkDailyWeatherForecasts: BallParkDailyWeatherForecast[]
  ): Promise<void>;
  findAll(): Promise<BallParkDailyWeatherForecast[]>;
  findByDateAndBallPark(
    from: Date,
    to: Date,
    ballParkId: number
  ): Promise<BallParkDailyWeatherForecast[]>;
}
