import { HourlyWeatherForecastDto } from "../dtos/HourlyWeatherForecastDto";

export interface HourlyWeatherForecastProvider {
  fetchHourlyForecasts(
    latitude: number,
    longitude: number,
    forecastDays: number
  ): Promise<HourlyWeatherForecastDto[]>;
}
