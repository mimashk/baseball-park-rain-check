import { TransactionContext } from "../../shared/interfaces/TransactionContext";
import { BallParkHourlyWeatherForecast } from "../valueObjects/BallParkHourlyWeatherForecast";

export interface BallParkHourlyWeatherForecastRepository {
  withTransaction(
    tx: TransactionContext
  ): BallParkHourlyWeatherForecastRepository;
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
