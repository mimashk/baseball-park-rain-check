export interface OpenMeteoVariable {
  valuesArray(): Float32Array | number[];
}
export interface OpenMeteoDataset {
  time(): number | bigint;
  timeEnd(): number | bigint;
  interval(): number;
  variables(index: number): OpenMeteoVariable | undefined;
}
export interface OpenMeteoResponse {
  utcOffsetSeconds(): number;
  dailyForecast(): OpenMeteoDataset | undefined;
  hourlyForecast(): OpenMeteoDataset | undefined;
  hourlyObservation(): OpenMeteoDataset | undefined;
}
export type DailyForecastResponse = Pick<
  OpenMeteoResponse,
  "utcOffsetSeconds" | "dailyForecast"
>;
export type HourlyForecastResponse = Pick<
  OpenMeteoResponse,
  "utcOffsetSeconds" | "hourlyForecast"
>;
export type HourlyObservationResponse = Pick<
  OpenMeteoResponse,
  "utcOffsetSeconds" | "hourlyObservation"
>;
