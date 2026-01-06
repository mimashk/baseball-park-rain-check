import { WeeklyWeatherOverview } from "../valueObjects/WeeklyWeatherOverview";

export interface WeeklyWeatherOverviewRepository {
  update(weeklyWeatherForecast: WeeklyWeatherOverview): Promise<void>;
  findAll(): Promise<WeeklyWeatherOverview[]>;
}
