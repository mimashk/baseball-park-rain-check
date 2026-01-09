export interface DailyWeatherForecastDto {
  date: Date;
  weatherPattern: number;
  temperatureMin: number;
  temperatureMax: number;
  precipitationProbability: number;
  rainFall: number;
}
