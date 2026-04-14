import {
  BallPark,
  BallParkId,
  openAirParks,
} from "../../../domain/scheduledGame/valueObjects/BallPark";
import { DomainError } from "../../../shared/errors/DomainError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ExportTrainingDatasetCsvRequest } from "../dtos/ExportTrainingDatasetCsvRequest";
import { TrainingDatasetRow } from "../dtos/TrainingDatasetRow";
import { FetchObservedHourlyWeatherService } from "../services/FetchObservedHourlyWeatherService";
import { FetchPastGamesService } from "../services/FetchPastGamesService";
import { BuildTrainingDatasetService } from "../services/BuildTrainingDatasetService";

const csvHeaders: (keyof TrainingDatasetRow)[] = [
  "gameDate",
  "ballParkId",
  "ballParkName",
  "homeTeamId",
  "homeTeamName",
  "awayTeamId",
  "awayTeamName",
  "cancelled",
  "logAvgRainFall",
  "rainOccurRate",
];

export class ExportTrainingDatasetCsvUseCase {
  constructor(
    private readonly fetchPastGamesService: FetchPastGamesService,
    private readonly fetchObservedHourlyWeatherService: FetchObservedHourlyWeatherService,
    private readonly buildTrainingDatasetService: BuildTrainingDatasetService
  ) {}

  async execute(request: ExportTrainingDatasetCsvRequest): Promise<string> {
    try {
      const targetBallParks = this.resolveTargetBallParks(request.ballParkId);
      const pastGames = await this.fetchPastGamesService.execute(
        request.from,
        request.to
      );
      const rows: TrainingDatasetRow[] = [];

      for (const ballPark of targetBallParks) {
        const ballParkId = ballPark.id();
        const observedHourlyWeathers =
          await this.fetchObservedHourlyWeatherService.execute(
            ballParkId,
            request.from,
            request.to
          );
        const gamesForBallPark = pastGames.filter(
          (game) => game.ballPark.id() === ballParkId
        );
        if (!gamesForBallPark.length || !observedHourlyWeathers.length) continue;

        rows.push(
          ...this.buildTrainingDatasetService.execute(
            gamesForBallPark,
            observedHourlyWeathers,
            request.timeWindowBeforeHours,
            request.timeWindowAfterHours
          )
        );
      }

      return [
        csvHeaders.join(","),
        ...rows.map((row) =>
          csvHeaders.map((header) => this.escapeCsv(row[header])).join(",")
        ),
      ].join("\n");
    } catch (err) {
      if (
        err instanceof DomainError ||
        err instanceof ValidationError ||
        err instanceof NotFoundError
      ) {
        throw err;
      }
      throw new DomainError("学習データCSVの出力に失敗しました", {
        cause: err,
        from: request.from,
        to: request.to,
        ballParkId: request.ballParkId,
      });
    }
  }

  private resolveTargetBallParks(ballParkId?: BallParkId): BallPark[] {
    const ballParks = openAirParks();
    if (ballParkId === undefined) return ballParks;
    const filtered = ballParks.filter((ballPark) => ballPark.id() === ballParkId);
    if (filtered.length === 0) {
      throw new ValidationError("対象の屋外球場が見つかりません", {
        ballParkId,
      });
    }
    return filtered;
  }

  private escapeCsv(value: string | number): string {
    const escaped = String(value);
    if (
      escaped.includes(",") ||
      escaped.includes('"') ||
      escaped.includes("\n")
    ) {
      return `"${escaped.replace(/"/g, '""')}"`;
    }
    return escaped;
  }
}
