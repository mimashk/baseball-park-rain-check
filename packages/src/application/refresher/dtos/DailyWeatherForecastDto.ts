export interface DailyWeatherForecastDto {
  date: Date;
  weatherCode: number;
  temperatureMin: number;
  temperatureMax: number;
  precipitationProbability: number;
  rainFall: number;
}
