import { TeamId } from "../../../domain/scheduledGame/valueObjects/BaseballTeam";

export interface ScheduledGameDto {
  date: Date;
  category: string;
  homeTeam: TeamId;
  awayTeam: TeamId;
  ballPark: string;
}
