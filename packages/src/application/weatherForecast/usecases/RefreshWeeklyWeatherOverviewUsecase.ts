import { WeeklyWeatherOverviewRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/WeeklyWeatherOverviewRepository";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { WeeklyWeatherOverview } from "../../../domain/weatherForecast/valueObjects/WeeklyWeatherOverview";
import { RefreshWeeklyWeatherOverviewRequest } from "../dtos/RefreshWeeklyWeatherOverviewRequest";
import { RefreshWeeklyWeatherOverviewResponse } from "../dtos/RefreshWeeklyWeatherOverviewResponse";
import { WeatherForecastProvider } from "../interfaces/WeatherForecastProvider";

export class RefreshWeeklyWeatherOverviewUsecase {
  constructor(
    private readonly weatherForecastProvider: WeatherForecastProvider,
    private readonly weeklyWeatherOverviewRepository: WeeklyWeatherOverviewRepository
  ) {}

  async execute(
    request: RefreshWeeklyWeatherOverviewRequest
  ): Promise<RefreshWeeklyWeatherOverviewResponse> {
    const normalizedFrom = new Date(request.from);
    const normalizedTo = new Date(request.to);
    const ballParkWeatherPoint = BallParkWeatherPoint.create(
      request.ballParkId
    );
    const dailyWeatherOverviews =
      await this.weatherForecastProvider.fetchDailyWeatherForecasts(
        normalizedFrom,
        normalizedTo,
        ballParkWeatherPoint.nearestWeatherStationName()
      );
    const weeklyWeatherOverview = WeeklyWeatherOverview.create({
      ballParkId: request.ballParkId,
      dailyWeatherOverviews: dailyWeatherOverviews,
      publishedAt: new Date(),
    });
    await this.weeklyWeatherOverviewRepository.update(weeklyWeatherOverview);

    return {
      message: `${normalizedFrom.toISOString()}から${normalizedTo.toISOString()}間の週間天気予報を更新しました`,
    };
  }
}
