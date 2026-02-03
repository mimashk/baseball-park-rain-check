import { GameCategoryType } from "../../../domain/scheduledGame/valueObjects/GameCategory";

export const GameCategoryDictionary: Record<string, GameCategoryType> = {
  セ・リーグ: GameCategoryType.CENTRAL_LEAGUE_REGULAR_SEASON,
  パ・リーグ: GameCategoryType.PACIFIC_LEAGUE_REGULAR_SEASON,
  オープン戦: GameCategoryType.EXHIBITION,
  セ・パ交流戦: GameCategoryType.INTERLEAGUE,
  CSセ・ファーストステージ: GameCategoryType.CLIMAX_SERIES,
  CSパ・ファーストステージ: GameCategoryType.CLIMAX_SERIES,
  CSセ・ファイナルステージ: GameCategoryType.CLIMAX_SERIES,
  CSパ・ファイナルステージ: GameCategoryType.CLIMAX_SERIES,
  日本シリーズ: GameCategoryType.JAPAN_SERIES,
};
