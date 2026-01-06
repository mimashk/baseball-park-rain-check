import { NearTermWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/NearTermWeatherForecastRepository";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { NearTermWeatherForecast } from "../../../domain/weatherForecast/valueObjects/NearTermWeatherForecast";
import { RefreshNearTermWeatherForecastRequest } from "../dtos/RefreshNearTermWeatherForecastRequest";
import { RefreshNearTermWeatherForecastResponse } from "../dtos/RefreshNearTermWeatherForecastResponse";
import { WeatherForecastProvider } from "../interfaces/WeatherForecastProvider";

export class RefreshNearTermWeatherForecastUsecase {
  constructor(
    private readonly weatherForecastProvider: WeatherForecastProvider,
    private readonly nearTermWeatherForecastRepository: NearTermWeatherForecastRepository
  ) {}

  async execute(
    request: RefreshNearTermWeatherForecastRequest
  ): Promise<RefreshNearTermWeatherForecastResponse> {
    const normalizedFrom = new Date(request.from);
    const normalizedTo = new Date(request.to);
    const ballParkWeatherPoint = BallParkWeatherPoint.create(
      request.ballParkId
    );
    const hourlyWeatherForecasts =
      await this.weatherForecastProvider.fetchHourlyWeatherForecasts(
        normalizedFrom,
        normalizedTo,
        ballParkWeatherPoint.latitude(),
        ballParkWeatherPoint.longitude()
      );
    const nearTermWeatherForecast = NearTermWeatherForecast.create({
      ballParkId: request.ballParkId,
      hourlyWeatherForecasts: hourlyWeatherForecasts,
      publishedAt: new Date(),
    });
    await this.nearTermWeatherForecastRepository.update(
      nearTermWeatherForecast
    );

    return {
      message: `${normalizedFrom.toISOString()}から${normalizedTo.toISOString()}間の直近の天気予報を更新しました`,
    };
  }
}
