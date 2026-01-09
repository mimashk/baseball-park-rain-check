import { DailyWeatherForecastDto } from "../dtos/DailyWeatherForecastDto";

export interface DailyWeatherForecastProvider {
  fetchDailyForecasts(
    latitude: number,
    longitude: number,
    forecastDays: number
  ): Promise<DailyWeatherForecastDto[]>;
}
