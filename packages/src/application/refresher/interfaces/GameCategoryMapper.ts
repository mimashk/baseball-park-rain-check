import { GameCategoryType } from "../../../domain/scheduledGame/valueObjects/GameCategory";

export interface GameCategoryMapper {
  toDomainCategory(externalCategory: string): GameCategoryType | undefined;
}
