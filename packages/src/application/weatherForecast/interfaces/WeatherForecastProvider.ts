import { DailyWeatherOverview } from "../../../domain/weatherForecast/valueObjects/DailyWeatherOverview";
import { HourlyWeatherForecast } from "../../../domain/weatherForecast/valueObjects/HourlyWeatherForecast";

export interface WeatherForecastProvider {
  fetchHourlyWeatherForecasts(
    from: Date,
    to: Date,
    latitude: number,
    longitude: number
  ): Promise<HourlyWeatherForecast[]>;
  fetchDailyWeatherForecasts(
    from: Date,
    to: Date,
    nearestStation: string
  ): Promise<DailyWeatherOverview[]>;
}
