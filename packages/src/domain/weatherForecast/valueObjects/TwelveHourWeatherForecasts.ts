import { HourlyWeatherForecast } from "./HourlyWeatherForecast";
import { BallParkWeatherPoint } from "./BallParkWeatherPoint";

export interface ShortTermWeatherProps {
  ballParkId: number;
  hourlyWeatherForecasts: HourlyWeatherForecast[];
  publishedAt: Date;
}

export class TwelveHourWeatherForecasts {
  constructor(
    readonly ballParkWeatherPoint: BallParkWeatherPoint,
    readonly hourlyWeatherForecasts: HourlyWeatherForecast[],
    readonly publishedAt: Date
  ) {}
  static create(props: ShortTermWeatherProps): TwelveHourWeatherForecasts {
    if (!props.ballParkId) {
      throw new Error("球場IDが指定されていません");
    }
    if (props.hourlyWeatherForecasts.length !== 12) {
      throw new Error("短期的な天気予報は12時間分でなければなりません");
    }
    if (
      !props.ballParkId ||
      !props.hourlyWeatherForecasts ||
      !props.publishedAt
    ) {
      throw new Error("必須項目が不足しています");
    }
    const normalizedPublishedAt = new Date(props.publishedAt);
    return new TwelveHourWeatherForecasts(
      BallParkWeatherPoint.create(props.ballParkId),
      props.hourlyWeatherForecasts,
      normalizedPublishedAt
    );
  }
}
