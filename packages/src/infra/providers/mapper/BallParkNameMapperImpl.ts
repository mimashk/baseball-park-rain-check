import { BallParkNameMapper } from "../../../application/shared/interfaces/BallParkNameMapper";
import {
  BallParkCatalog,
  KnownBallParkName,
} from "../../../domain/scheduledGame/valueObjects/BallPark";
import { BallParkDictionary } from "./BallParkDictionary";

export class BallParkNameMapperImpl implements BallParkNameMapper {
  private readonly dictionary: Record<string, string>;
  private readonly knownNames = new Set<KnownBallParkName>(
    Object.values(BallParkCatalog).map((b) => b.labelJa)
  );
  constructor(dictionary: Record<string, string> = BallParkDictionary) {
    this.dictionary = dictionary;
  }
  toDomainBallPark(externalName: string): string {
    if (this.isKnown(externalName)) return externalName; // 既に正式名ならそのまま
    const mapped = this.dictionary[externalName];
    if (mapped) return mapped as KnownBallParkName;
    return externalName;
  }

  private isKnown(name: string): name is KnownBallParkName {
    return this.knownNames.has(name as KnownBallParkName);
  }
}
