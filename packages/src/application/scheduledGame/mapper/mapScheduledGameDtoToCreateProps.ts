import { CreateScheduledGameProps } from "../../../domain/scheduledGame/entities/ScheduledGame";
import { ScheduledGameDto } from "../dtos/ScheduledGameDto";

export function mapScheduledGameDtoToCreateProps(
  dto: ScheduledGameDto
): CreateScheduledGameProps {
  return {
    date: dto.date,
    category: dto.category,
    homeTeam: dto.homeTeam,
    awayTeam: dto.awayTeam,
    ballPark: dto.ballPark,
  };
}
