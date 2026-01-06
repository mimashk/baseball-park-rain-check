import { ObservedHourlyWeather } from "../valueObjects/ObservedHourlyWeather";

export interface ObservedHourlyWeatherRepository {
  saveMany(observedHourlyWeathers: ObservedHourlyWeather[]): Promise<void>;
  findByDateAndBallPark(
    from: Date,
    to: Date,
    ballParkId: number
  ): Promise<ObservedHourlyWeather[]>;
}
