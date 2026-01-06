import { HourlyWeatherForecast } from "./HourlyWeatherForecast";
import { BallParkWeatherPoint } from "./BallParkWeatherPoint";
import { BallParkId } from "../../scheduledGame/valueObjects/BallPark";

export interface NearTermWeatherForecastProps {
  ballParkId: BallParkId;
  hourlyWeatherForecasts: HourlyWeatherForecast[];
  publishedAt: Date;
}

export class NearTermWeatherForecast {
  constructor(
    readonly ballParkWeatherPoint: BallParkWeatherPoint,
    readonly hourlyWeatherForecasts: HourlyWeatherForecast[],
    readonly publishedAt: Date
  ) {}
  static create(props: NearTermWeatherForecastProps): NearTermWeatherForecast {
    if (!props.ballParkId) {
      throw new Error("球場IDが指定されていません");
    }
    if (props.hourlyWeatherForecasts.length < 12) {
      throw new Error("近期的な天気予報は12時間以上のデータが必要です");
    }
    const normalizedPublishedAt = new Date(props.publishedAt);
    return new NearTermWeatherForecast(
      BallParkWeatherPoint.create(props.ballParkId),
      props.hourlyWeatherForecasts,
      normalizedPublishedAt
    );
  }
}
