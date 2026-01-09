import { CreatePastGameRecordProps } from "../../../domain/training/valueObjects/PastGameRecord";
import { PastGameRecordDto } from "../dtos/PastGameRecordDto";

export function mapPastGameDtoToCreateProps(
  dto: PastGameRecordDto
): CreatePastGameRecordProps {
  return {
    date: dto.date,
    homeTeam: dto.homeTeam,
    awayTeam: dto.awayTeam,
    ballPark: dto.ballPark,
    cancelled: dto.cancelled,
  };
}
