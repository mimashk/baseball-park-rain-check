import { BallParkObservedHourlyWeather } from "../../../domain/training/valueObjects/BallParkObservedHourlyWeather";
import { PastGameRecord } from "../../../domain/training/valueObjects/PastGameRecord";
import { TimeWindowSpec } from "../../../domain/training/valueObjects/TimeWindowSpec";
import { TrainingWeatherFeatureAggregator } from "../../../domain/training/services/TrainingWeatherFeatureAggregator";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { buildCancellationFeatures } from "../../shared/utils/buildCancellationFeatures";
import { TrainingDatasetRow } from "../dtos/TrainingDatasetRow";

export class BuildTrainingDatasetService {
  execute(
    pastGames: PastGameRecord[],
    observedHourlyWeathers: BallParkObservedHourlyWeather[],
    timeWindowBeforeHours: number,
    timeWindowAfterHours: number
  ): TrainingDatasetRow[] {
    const window = TimeWindowSpec.create({
      beforeHours: timeWindowBeforeHours,
      afterHours: timeWindowAfterHours,
    });

    const rows = pastGames.flatMap((game) => {
      const { from: windowFrom, to: windowTo } = window.toRange(game.date);
      const hourlyWeathers = observedHourlyWeathers.filter((weather) => {
        if (weather.ballParkId !== game.ballPark.id()) return false;
        const weatherDate = weather.date.getTime();
        return (
          weatherDate >= windowFrom.getTime() &&
          weatherDate <= windowTo.getTime()
        );
      });
      if (!hourlyWeathers.length) return [];

      const aggregated =
        TrainingWeatherFeatureAggregator.aggregate(hourlyWeathers);
      const transformed = buildCancellationFeatures({
        avgRainFall: aggregated.avgRainFall.toNumber(),
        rainOccurRate: aggregated.rainOccurRate,
      });

      return [
        {
          gameDate: game.date.toISOString(),
          ballParkId: game.ballPark.id(),
          ballParkName: game.ballPark.name(),
          homeTeamId: game.homeTeam.id(),
          homeTeamName: game.homeTeam.labelJa(),
          awayTeamId: game.awayTeam.id(),
          awayTeamName: game.awayTeam.labelJa(),
          cancelled: game.cancelled.toNumber(),
          logAvgRainFall: transformed.logAvgRainFall,
          rainOccurRate: transformed.rainOccurRate,
        },
      ];
    });

    if (rows.length === 0) {
      throw new ValidationError("学習に使えるデータがありません", {
        timeWindowBeforeHours,
        timeWindowAfterHours,
      });
    }

    return rows;
  }
}
