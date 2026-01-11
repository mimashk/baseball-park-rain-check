import { TransactionContext } from "../../shared/interfaces/TransactionContext";
import { BallParkDailyWeatherForecast } from "../valueObjects/BallParkDailyWeatherForecast";

export interface BallParkDailyWeatherForecastRepository {
  withTransaction(
    tx: TransactionContext
  ): BallParkDailyWeatherForecastRepository;
  updateMany(
    ballParkDailyWeatherForecasts: BallParkDailyWeatherForecast[]
  ): Promise<void>;
  findAll(): Promise<BallParkDailyWeatherForecast[]>;
}
