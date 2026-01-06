import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";

export interface RefreshWeeklyWeatherOverviewRequest {
  ballParkId: BallParkId;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}
