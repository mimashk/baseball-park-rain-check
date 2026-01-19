import { DailyWeatherForecastDto } from "../dtos/DailyWeatherForecastDto";

export type DailyForecastPoint = {
  date: Date;
  latitude: number;
  longitude: number;
};

export interface DailyWeatherForecastProvider {
  fetchDailyForecasts(
    points: DailyForecastPoint[]
  ): Promise<DailyWeatherForecastDto[]>;
}
