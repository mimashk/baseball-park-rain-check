import { BallParkHourlyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkHourlyWeatherForecastRepository";
import { BallParkHourlyWeatherForecast } from "../../../domain/weatherForecast/valueObjects/BallParkHourlyWeatherForecast";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { DomainError } from "../../../shared/errors/DomainError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ValidationError } from "../../../shared/errors/ValidationError";
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
    if (request.forecastDays <= 0) {
      throw new ValidationError("予報日数は1以上で指定してください", {
        forecastDays: request.forecastDays,
      });
    }
    try {
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
    } catch (err: unknown) {
      if (err instanceof DomainError || err instanceof ValidationError) {
        throw err;
      }

      // プロバイダ／永続化など外部I/Oエラー
      throw new DomainError("天気予報の更新に失敗しました", {
        cause: err,
        ballParkId: request.ballParkId,
      });
    }
  }
}
