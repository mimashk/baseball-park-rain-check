import { BatchJobName } from "../../../../application/shared/interfaces/BatchStatusWriter";

// ScheduledGame
export const scheduledGameByDateKey = (jstDate: string, gameId: string) =>
  `scheduled-games/by-date-jst/${jstDate}/${gameId}.json`;

export const scheduledGameByIdKey = (gameId: string) =>
  `scheduled-games/by-id/${gameId}.json`;

export const scheduledGameByDatePrefix = (jstDate: string) =>
  `scheduled-games/by-date-jst/${jstDate}/`;

// BallParkHourlyWeatherForecast
export const ballParkHourlyWeatherForecastFileKey = (
  ballParkId: number,
  jstDate: string
) => `hourly-weather/by-park/${ballParkId}/${jstDate}.json`;

// BallParkDailyWeatherForecast
export const ballParkDailyWeatherForecastFileKey = (
  ballParkId: number,
  jstDate: string
) => `daily-weather/by-park/${ballParkId}/${jstDate}.json`;

// CancellationPrediction
export const cancellationPredictionFileKey = (gameId: string) =>
  `predictions/by-game/${gameId}.json`;

// BatchStatus
export const batchStatusKey = (job: BatchJobName) =>
  `meta/batch-status/${job}.json`;

// CancellationModel
export const cancellationModelLatestFileKey = (ballParkId: number) =>
  `models/latest/by-park/${ballParkId}.json`;
