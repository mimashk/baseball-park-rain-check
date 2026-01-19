import { TeamId } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";

export interface PastGameRecordDto {
  date: Date;
  homeTeam: TeamId;
  awayTeam: TeamId;
  ballPark: string;
  cancelled: boolean;
}
