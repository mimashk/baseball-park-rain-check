export class OpenMeteoParamsGenerator {
  static buildDailyForecast(input: {
    latitude: number;
    longitude: number;
    forecastDays: number;
  }) {
    return {
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: "Asia/Tokyo",
      forecast_days: input.forecastDays,
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_probability_max",
        "precipitation_sum",
      ],
    };
  }

  static buildHourlyForecast(input: {
    latitude: number;
    longitude: number;
    forecastDays: number;
  }) {
    return {
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: "Asia/Tokyo",
      forecast_days: input.forecastDays,
      hourly: [
        "weather_code",
        "temperature_2m",
        "precipitation_probability",
        "precipitation",
      ],
    };
  }

  static buildHourlyArchive(input: {
    latitude: number;
    longitude: number;
    startDate: string;
    endDate: string;
  }) {
    return {
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: "Asia/Tokyo",
      start_date: input.startDate,
      end_date: input.endDate,
      hourly: ["temperature_2m", "rain"],
    };
  }
}
