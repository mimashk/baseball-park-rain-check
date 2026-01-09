import { BallPark } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkHourlyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkHourlyWeatherForecastRepository";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { BallParkHourlyWeatherForecast } from "../../../domain/weatherForecast/valueObjects/BallParkHourlyWeatherForecast";
import { RefreshHourlyWeatherForecastsRequest } from "../dtos/RefreshHourlyWeatherForecastsRequest";
import { RefreshHourlyWeatherForecastsResponse } from "../dtos/RefreshHourlyWeatherForecastsResponse";
import { HourlyWeatherForecastProvider } from "../interfaces/HourlyWeatherForecastProvider";
import { mapHourlyWeatherForecastDtoToProps } from "../mapper/mapHourlyWeatherForecastDtoToProps";

export class RefreshHourlyWeatherForecastsUsecase {
  constructor(
    private readonly weatherForecastProvider: HourlyWeatherForecastProvider,
    private readonly ballParkHourlyWeatherForecastRepository: BallParkHourlyWeatherForecastRepository
  ) {}

  async execute(
    request: RefreshHourlyWeatherForecastsRequest
  ): Promise<RefreshHourlyWeatherForecastsResponse> {
    const ballParkWeatherPoint = BallParkWeatherPoint.create(
      request.ballParkId
    );
    const hourlyWeatherForecastDtos =
      await this.weatherForecastProvider.fetchHourlyForecasts(
        ballParkWeatherPoint.latitude(),
        ballParkWeatherPoint.longitude(),
        request.forecastDays
      );
    const hourlyWeatherForecasts = hourlyWeatherForecastDtos
      .map((hourlyWeatherForecastDto) =>
        mapHourlyWeatherForecastDtoToProps(
          hourlyWeatherForecastDto,
          request.ballParkId
        )
      )
      .map(BallParkHourlyWeatherForecast.create);
    await this.ballParkHourlyWeatherForecastRepository.updateMany(
      hourlyWeatherForecasts
    );

    return {
      message: `${request.forecastDays}日間の直近の天気予報を更新しました`,
    };
  }
}
