import { BallPark } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkDailyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkDailyWeatherForecastRepository";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { BallParkDailyWeatherForecast } from "../../../domain/weatherForecast/valueObjects/BallParkDailyWeatherForecast";
import { RefreshDailyWeatherForecastsRequest } from "../dtos/RefreshDailyWeatherForecastsRequest";
import { RefreshDailyWeatherForecastsResponse } from "../dtos/RefreshDailyWeatherForecastsResponse";
import { DailyWeatherForecastProvider } from "../interfaces/DailyWeatherForecastProvider";
import { mapDailyWeatherForecastDtoToProps } from "../mapper/mapDailyWeatherForecastDtoToProps";

export class RefreshDailyWeatherForecastsUsecase {
  constructor(
    private readonly weatherForecastProvider: DailyWeatherForecastProvider,
    private readonly ballParkDailyWeatherForecastRepository: BallParkDailyWeatherForecastRepository
  ) {}

  async execute(
    request: RefreshDailyWeatherForecastsRequest
  ): Promise<RefreshDailyWeatherForecastsResponse> {
    const ballParkWeatherPoint = BallParkWeatherPoint.create(
      request.ballParkId
    );
    const dailyWeatherForecastDtos =
      await this.weatherForecastProvider.fetchDailyForecasts(
        ballParkWeatherPoint.latitude(),
        ballParkWeatherPoint.longitude(),
        request.forecastDays
      );
    const dailyWeatherOverviews = dailyWeatherForecastDtos
      .map((dailyWeatherForecastDto) =>
        mapDailyWeatherForecastDtoToProps(
          dailyWeatherForecastDto,
          request.ballParkId
        )
      )
      .map(BallParkDailyWeatherForecast.create);
    await this.ballParkDailyWeatherForecastRepository.updateMany(
      dailyWeatherOverviews
    );

    return {
      message: `${request.forecastDays}日間の週間天気予報を更新しました`,
    };
  }
}
