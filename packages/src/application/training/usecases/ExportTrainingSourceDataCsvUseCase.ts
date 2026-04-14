import {
  BallPark,
  BallParkId,
  openAirParks,
} from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { DomainError } from "../../../shared/errors/DomainError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ExportTrainingDatasetCsvRequest } from "../dtos/ExportTrainingDatasetCsvRequest";
import { ExportTrainingSourceDataCsvResponse } from "../dtos/ExportTrainingSourceDataCsvResponse";
import { ObservedHourlyWeatherDto } from "../dtos/ObservedHourlyWeatherDto";
import { PastGameRecordDto } from "../dtos/PastGameRecordDto";
import { ObservedHourlyWeatherProvider } from "../interfaces/ObservedHourlyWeatherProvider";
import { PastGameRecordFetcher } from "../interfaces/PastGameRecordFetcher";

type PastGamesCsvRow = {
  date: string;
  homeTeam: string;
  awayTeam: string;
  ballPark: string;
  cancelled: boolean;
};

type ObservedHourlyWeatherCsvRow = {
  ballParkId: BallParkId;
  ballParkName: string;
  date: string;
  temperature: number;
  rainFall: number;
};

const pastGamesCsvHeaders: (keyof PastGamesCsvRow)[] = [
  "date",
  "homeTeam",
  "awayTeam",
  "ballPark",
  "cancelled",
];

const observedHourlyWeatherCsvHeaders: (keyof ObservedHourlyWeatherCsvRow)[] = [
  "ballParkId",
  "ballParkName",
  "date",
  "temperature",
  "rainFall",
];

export class ExportTrainingSourceDataCsvUseCase {
  constructor(
    private readonly pastGameFetcher: PastGameRecordFetcher,
    private readonly observedHourlyWeatherProvider: ObservedHourlyWeatherProvider
  ) {}

  async execute(
    request: ExportTrainingDatasetCsvRequest
  ): Promise<ExportTrainingSourceDataCsvResponse> {
    try {
      const targetBallParks = this.resolveTargetBallParks(request.ballParkId);
      const rawPastGames = await this.pastGameFetcher.fetchPastGameRecords(
        request.from,
        request.to
      );
      const pastGamesRows = rawPastGames
        .filter((game) => this.isInRange(game, request.from, request.to))
        .filter((game) => this.isTargetBallParkGame(game, targetBallParks))
        .map((game) => ({
          date: game.date.toISOString(),
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          ballPark: game.ballPark,
          cancelled: game.cancelled,
        }));

      const observedHourlyWeatherRows: ObservedHourlyWeatherCsvRow[] = [];

      for (const ballPark of targetBallParks) {
        const weatherPoint = BallParkWeatherPoint.create(ballPark.id());
        const observations =
          await this.observedHourlyWeatherProvider.fetchHourlyObservations(
            weatherPoint.latitude(),
            weatherPoint.longitude(),
            request.from,
            request.to
          );
        observedHourlyWeatherRows.push(
          ...observations.map((observation) =>
            this.toObservedHourlyWeatherRow(observation, ballPark)
          )
        );
      }

      return {
        pastGamesCsv: this.buildCsv(pastGamesCsvHeaders, pastGamesRows),
        observedHourlyWeatherCsv: this.buildCsv(
          observedHourlyWeatherCsvHeaders,
          observedHourlyWeatherRows
        ),
      };
    } catch (err) {
      if (
        err instanceof DomainError ||
        err instanceof ValidationError ||
        err instanceof NotFoundError
      ) {
        throw err;
      }
      throw new DomainError("試合データと観測天気CSVの出力に失敗しました", {
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

  private isInRange(game: PastGameRecordDto, from: Date, to: Date): boolean {
    const time = game.date.getTime();
    return time >= from.getTime() && time <= to.getTime();
  }

  private isTargetBallParkGame(
    game: PastGameRecordDto,
    targetBallParks: BallPark[]
  ): boolean {
    const gameBallParkId = BallPark.fromString(game.ballPark).id();
    return targetBallParks.some((ballPark) => ballPark.id() === gameBallParkId);
  }

  private toObservedHourlyWeatherRow(
    dto: ObservedHourlyWeatherDto,
    ballPark: BallPark
  ): ObservedHourlyWeatherCsvRow {
    return {
      ballParkId: ballPark.id(),
      ballParkName: ballPark.name(),
      date: dto.date.toISOString(),
      temperature: dto.temperature,
      rainFall: dto.rainFall,
    };
  }

  private buildCsv<T extends Record<string, string | number | boolean>>(
    headers: (keyof T)[],
    rows: T[]
  ): string {
    return [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((header) => this.escapeCsv(row[header])).join(",")
      ),
    ].join("\n");
  }

  private escapeCsv(value: string | number | boolean): string {
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
