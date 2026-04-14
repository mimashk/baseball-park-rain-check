import { BallParkId } from "../../../domain/scheduledGame/valueObjects/BallPark";
import { TeamId } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";

export interface TrainingDatasetRow {
  gameDate: string;
  ballParkId: BallParkId;
  ballParkName: string;
  homeTeamId: TeamId;
  homeTeamName: string;
  awayTeamId: TeamId;
  awayTeamName: string;
  cancelled: 0 | 1;
  logAvgRainFall: number;
  rainOccurRate: number;
}
