import { PrismaClient } from "./prisma/generate/internal/class";

export class PrismaClientWrapper {
  private static instance: PrismaClient;

  /**
   * PrismaClient のシングルトンインスタンスを返します。
   * 複数箇所からインスタンスを利用することで接続の再利用が可能になります。
   */
  public static getInstance(): PrismaClient {
    if (!PrismaClientWrapper.instance) {
      PrismaClientWrapper.instance = new PrismaClient();
    }
    return PrismaClientWrapper.instance;
  }
}
