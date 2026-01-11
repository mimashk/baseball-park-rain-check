import { BallParkDailyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkDailyWeatherForecastRepository";
import { BallParkDailyWeatherForecast } from "../../../domain/weatherForecast/valueObjects/BallParkDailyWeatherForecast";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { TransactionExecutor } from "../../shared/interfaces/TransactionExecutor";
import { RefreshDailyWeatherForecastsRequest } from "../dtos/RefreshDailyWeatherForecastsRequest";
import { RefreshDailyWeatherForecastsResponse } from "../dtos/RefreshDailyWeatherForecastsResponse";
import { DailyWeatherForecastProvider } from "../interfaces/DailyWeatherForecastProvider";
import { mapDailyWeatherForecastDtoToProps } from "../mapper/mapDailyWeatherForecastDtoToProps";

export class RefreshDailyWeatherForecastsUsecase {
  constructor(
    private readonly weatherForecastProvider: DailyWeatherForecastProvider,
    private readonly ballParkDailyWeatherForecastRepository: BallParkDailyWeatherForecastRepository,
    private readonly txExecutor: TransactionExecutor
  ) {}

  async execute(
    request: RefreshDailyWeatherForecastsRequest
  ): Promise<RefreshDailyWeatherForecastsResponse> {
    if (request.forecastDays <= 0) {
      throw new ValidationError("予報日数は1以上で指定してください", {
        forecastDays: request.forecastDays,
      });
    }
    try {
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

      await this.txExecutor.run(async (trx) => {
        await this.ballParkDailyWeatherForecastRepository
          .withTransaction(trx)
          .updateMany(dailyWeatherOverviews);
      });

      return {
        message: `${request.forecastDays}日間の週間天気予報を更新しました`,
      };
    } catch (err: unknown) {
      // ドメイン系はそのまま再throw
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
