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
  daily(): OpenMeteoDataset | undefined;
  hourly(): OpenMeteoDataset | undefined;
}
export type DailyForecastResponse = Pick<
  OpenMeteoResponse,
  "utcOffsetSeconds" | "daily"
>;
export type HourlyForecastResponse = Pick<
  OpenMeteoResponse,
  "utcOffsetSeconds" | "hourly"
>;
export type HourlyObservationResponse = Pick<
  OpenMeteoResponse,
  "utcOffsetSeconds" | "hourly"
>;
