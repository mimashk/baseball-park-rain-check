import { DailyWeatherOverview } from "./DailyWeatherOverview";
import { BallParkWeatherPoint } from "./BallParkWeatherPoint";

export interface WeeklyForecastProps {
  ballParkId: number;
  dailyWeatherOverviews: DailyWeatherOverview[];
  publishedAt: Date;
}

export class WeeklyForecast {
  private constructor(
    readonly ballParkWeatherPoint: BallParkWeatherPoint,
    readonly dailyWeatherOverviews: DailyWeatherOverview[],
    readonly publishedAt: Date
  ) {}

  static create(props: WeeklyForecastProps): WeeklyForecast {
    if (!props.ballParkId) {
      throw new Error("球場IDが指定されていません");
    }
    if (props.dailyWeatherOverviews.length !== 7) {
      throw new Error("週間予報は7日分でなければなりません");
    }

    const dateKeys = props.dailyWeatherOverviews.map((d) => toDateKey(d.date));
    const uniqueKeys = new Set(dateKeys);

    if (uniqueKeys.size !== dateKeys.length) {
      throw new Error("日付は重複してはいけません");
    }
    const normalizedPublishedAt = new Date(props.publishedAt);

    return new WeeklyForecast(
      BallParkWeatherPoint.create(props.ballParkId),
      props.dailyWeatherOverviews,
      normalizedPublishedAt
    );
  }
}

function toDateKey(date: Date): string {
  // 例: "2026-01-03"
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
