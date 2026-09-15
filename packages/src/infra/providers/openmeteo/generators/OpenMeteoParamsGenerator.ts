export class OpenMeteoParamsGenerator {
  static buildDailyForecast(input: {
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
      // 降水量は precipitation を使う。rain に変えてはいけない。
      //
      // 学習は archive(ERA5)の rain を使っており、ERA5 の rain は
      // 「総降水量から雪を除いた液体降水すべて」= 対流性の雨も含む。
      // 一方 forecast 側の rain は showers(対流性)を除いた値で、別物。
      // forecast では precipitation = rain + showers + snowfall なので、
      // 雪が無い限り precipitation が ERA5 の rain と対応する。
      //
      // models 未指定(best_match)は MSM が届く3日半までは jma_msm を返し、
      // そこから先は showers を分離するモデルに切り替わる。
      // そのため rain だけにすると4日目以降の夕立を丸ごと落とす(実測で全体の約39%)。
      // forecastDays=10 で運用している以上、この差は無視できない。
      //
      // 配列の順序は HourlyForecastMapper がインデックスで参照しているため、
      // 要素を足し引きする場合はマッパー側も合わせること。
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
