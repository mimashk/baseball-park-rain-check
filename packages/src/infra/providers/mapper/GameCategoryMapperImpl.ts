import { GameCategoryMapper } from "../../../application/refresher/interfaces/GameCategoryMapper";
import { GameCategoryType } from "../../../domain/scheduledGame/valueObjects/GameCategory";
import { GameCategoryDictionary } from "./GameCategoryDictionary";

export class GameCategoryMapperImpl implements GameCategoryMapper {
  constructor(
    private readonly dictionary: Record<
      string,
      GameCategoryType
    > = GameCategoryDictionary
  ) {}

  toDomainCategory(externalCategory: string): GameCategoryType | undefined {
    const category = this.dictionary[externalCategory];
    if (!category) return undefined;
    return category;
  }
}
