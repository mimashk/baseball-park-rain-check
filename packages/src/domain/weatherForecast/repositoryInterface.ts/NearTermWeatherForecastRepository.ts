import { NearTermWeatherForecast } from "../valueObjects/NearTermWeatherForecast";

export interface NearTermWeatherForecastRepository {
  update(nearTermWeatherForecast: NearTermWeatherForecast): Promise<void>;
  findAll(): Promise<NearTermWeatherForecast | null>;
  findByDateAndBallPark(
    from: Date,
    to: Date,
    ballParkId: number
  ): Promise<NearTermWeatherForecast | null>;
}
