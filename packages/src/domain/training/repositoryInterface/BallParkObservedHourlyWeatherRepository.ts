import { BallParkId } from "../../scheduledGame/valueObjects/BallPark";
import { TransactionContext } from "../../shared/interfaces/TransactionContext";
import { BallParkObservedHourlyWeather } from "../valueObjects/BallParkObservedHourlyWeather";

export interface BallParkObservedHourlyWeatherRepository {
  upsertMany(
    observedHourlyWeathers: BallParkObservedHourlyWeather[]
  ): Promise<void>;
  findByDateAndBallPark(
    from: Date,
    to: Date,
    ballParkId: BallParkId
  ): Promise<BallParkObservedHourlyWeather[]>;
}
