import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkHourlyWeatherForecastRepository } from "../../../domain/weatherForecast/repositoryInterface.ts/BallParkHourlyWeatherForecastRepository";
import { BallParkHourlyWeatherForecast } from "../../../domain/weatherForecast/valueObjects/BallParkHourlyWeatherForecast";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { DomainError } from "../../../shared/errors/DomainError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { TransactionExecutor } from "../../shared/interfaces/TransactionExecutor";
import { HourlyWeatherForecastProvider } from "../interfaces/HourlyWeatherForecastProvider";
import { mapHourlyWeatherForecastDtoToProps } from "../mapper/mapHourlyWeatherForecastDtoToProps";

export class RefreshHourlyWeatherForecastsService {
  constructor(
    private readonly weatherForecastProvider: HourlyWeatherForecastProvider,
    private readonly ballParkHourlyWeatherForecastRepository: BallParkHourlyWeatherForecastRepository,
    private readonly txExecutor: TransactionExecutor
  ) {}

  async execute(
    ballParkId: BallParkId,
    forecastDays: number
  ): Promise<BallParkHourlyWeatherForecast[]> {
    if (forecastDays <= 0) {
      throw new ValidationError("予報日数は1以上で指定してください", {
        forecastDays: forecastDays,
      });
    }
    try {
      const ballParkWeatherPoint = BallParkWeatherPoint.create(ballParkId);
      const hourlyWeatherForecastDtos =
        await this.weatherForecastProvider.fetchHourlyForecasts(
          ballParkWeatherPoint.latitude(),
          ballParkWeatherPoint.longitude(),
          forecastDays
        );
      const hourlyWeatherForecasts = hourlyWeatherForecastDtos
        .map((hourlyWeatherForecastDto) =>
          mapHourlyWeatherForecastDtoToProps(
            hourlyWeatherForecastDto,
            ballParkId
          )
        )
        .map(BallParkHourlyWeatherForecast.create);

      await this.txExecutor.run(async (trx) => {
        await this.ballParkHourlyWeatherForecastRepository
          .withTransaction(trx)
          .updateMany(hourlyWeatherForecasts);
      });

      return hourlyWeatherForecasts;
    } catch (err: unknown) {
      if (err instanceof DomainError || err instanceof ValidationError) {
        throw err;
      }

      // プロバイダ／永続化など外部I/Oエラー
      throw new DomainError("天気予報の更新に失敗しました", {
        cause: err,
        ballParkId: ballParkId,
      });
    }
  }
}
