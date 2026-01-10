import { BallParkObservedHourlyWeatherRepository } from "../../../domain/training/repositoryInterface/BallParkObservedHourlyWeatherRepository";
import { BallParkObservedHourlyWeather } from "../../../domain/training/valueObjects/BallParkObservedHourlyWeather";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { DomainError } from "../../../shared/errors/DomainError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureValidDateRange } from "../../shared/utils/ensureValidDateRange";
import { UpsertObservedHourlyWeatherRequest } from "../dtos/UpsertObservedHourlyWeatherRequest";
import { UpsertObservedHourlyWeatherResponse } from "../dtos/UpsertObservedHourlyWeatherResponse";
import { ObservedHourlyWeatherProvider } from "../interfaces/ObservedHourlyWeatherProvider";
import { mapObservedHourlyWeatherDtoToProps } from "../mapper/mapObservedHourlyWeatherDtoToProps";

export class UpsertObservedHourlyWeatherUsecase {
  constructor(
    private readonly observedHourlyWeatherProvider: ObservedHourlyWeatherProvider,
    private readonly observedHourlyWeatherRepository: BallParkObservedHourlyWeatherRepository
  ) {}

  async execute(
    request: UpsertObservedHourlyWeatherRequest
  ): Promise<UpsertObservedHourlyWeatherResponse> {
    const { from: normalizedFrom, to: normalizedTo } = ensureValidDateRange(
      "from",
      "to",
      request.from,
      request.to
    );

    try {
      const ballParkWeatherPoint = BallParkWeatherPoint.create(
        request.ballParkId
      );
      const observedHourlyWeatherDtos =
        await this.observedHourlyWeatherProvider.fetchHourlyObservations(
          ballParkWeatherPoint.latitude(),
          ballParkWeatherPoint.longitude(),
          request.from,
          request.to
        );
      const observedHourlyWeathers = observedHourlyWeatherDtos.map((dto) => {
        try {
          const props = mapObservedHourlyWeatherDtoToProps(
            dto,
            request.ballParkId
          );
          return BallParkObservedHourlyWeather.create(props);
        } catch (err: unknown) {
          // どのレコードで落ちたか分かるように補足
          throw new ValidationError("観測データの変換に失敗しました", {
            dto,
            cause: err,
          });
        }
      });
      await this.observedHourlyWeatherRepository.upsertMany(
        observedHourlyWeathers
      );
      return {
        message: `${request.from.toISOString()}から${request.to.toISOString()}間の観測データを更新しました`,
      };
    } catch (err) {
      if (
        err instanceof DomainError ||
        err instanceof ValidationError ||
        err instanceof NotFoundError
      ) {
        throw err;
      }
      throw new DomainError("観測データの更新に失敗しました", {
        cause: err,
        ballParkId: request.ballParkId,
        from: request.from,
        to: request.to,
      });
    }
  }
}
