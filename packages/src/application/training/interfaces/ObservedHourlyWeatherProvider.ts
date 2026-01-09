import { ObservedHourlyWeatherDto } from "../dtos/ObservedHourlyWeatherDto";

export interface ObservedHourlyWeatherProvider {
  fetchHourlyObservations(
    latitude: number,
    longitude: number,
    from: Date,
    to: Date
  ): Promise<ObservedHourlyWeatherDto[]>;
}
