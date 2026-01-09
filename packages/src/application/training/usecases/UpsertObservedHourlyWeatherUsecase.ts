import { BallParkObservedHourlyWeatherRepository } from "../../../domain/training/repositoryInterface/BallParkObservedHourlyWeatherRepository";
import { BallParkObservedHourlyWeather } from "../../../domain/training/valueObjects/BallParkObservedHourlyWeather";
import { BallParkWeatherPoint } from "../../../domain/weatherForecast/valueObjects/BallParkWeatherPoint";
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
    const observedHourlyWeathers = observedHourlyWeatherDtos
      .map((observedHourlyWeatherDto) =>
        mapObservedHourlyWeatherDtoToProps(
          observedHourlyWeatherDto,
          request.ballParkId
        )
      )
      .map(BallParkObservedHourlyWeather.create);
    await this.observedHourlyWeatherRepository.upsertMany(
      observedHourlyWeathers
    );
    return {
      message: `${request.from.toISOString()}から${request.to.toISOString()}間の観測データを更新しました`,
    };
  }
}
