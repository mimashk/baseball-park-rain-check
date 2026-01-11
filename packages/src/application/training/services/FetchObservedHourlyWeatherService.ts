import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkObservedHourlyWeather } from "../../../domain/training/valueObjects/BallParkObservedHourlyWeather";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
import { DomainError } from "../../../shared/errors/DomainError";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ValidationError } from "../../../shared/errors/ValidationError";
import { ensureValidDateRange } from "../../shared/utils/ensureValidDateRange";
import { ObservedHourlyWeatherProvider } from "../interfaces/ObservedHourlyWeatherProvider";
import { mapObservedHourlyWeatherDtoToProps } from "../mapper/mapObservedHourlyWeatherDtoToProps";

export class FetchObservedHourlyWeatherService {
  constructor(
    private readonly observedHourlyWeatherProvider: ObservedHourlyWeatherProvider
  ) {}

  async execute(
    ballParkId: BallParkId,
    from: Date,
    to: Date
  ): Promise<BallParkObservedHourlyWeather[]> {
    const { from: normalizedFrom, to: normalizedTo } = ensureValidDateRange(
      "from",
      "to",
      from,
      to
    );

    try {
      const ballParkWeatherPoint = BallParkWeatherPoint.create(ballParkId);
      const observedHourlyWeatherDtos =
        await this.observedHourlyWeatherProvider.fetchHourlyObservations(
          ballParkWeatherPoint.latitude(),
          ballParkWeatherPoint.longitude(),
          normalizedFrom,
          normalizedTo
        );
      const observedHourlyWeathers = observedHourlyWeatherDtos.map((dto) => {
        try {
          const props = mapObservedHourlyWeatherDtoToProps(dto, ballParkId);
          return BallParkObservedHourlyWeather.create(props);
        } catch (err: unknown) {
          // どのレコードで落ちたか分かるように補足
          throw new ValidationError("観測データの変換に失敗しました", {
            dto,
            cause: err,
          });
        }
      });
      return observedHourlyWeathers;
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
        ballParkId,
        from,
        to,
      });
    }
  }
}
