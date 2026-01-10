// Use the public Prisma client entrypoint (internal/class only exports types)
import { DbError } from "../../../shared/errors/DbError";
import { PrismaClient } from "./prisma/generate/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

export class PrismaClientWrapper {
  private static instance: PrismaClient;

  /**
   * PrismaClient のシングルトンインスタンスを返します。
   * 複数箇所からインスタンスを利用することで接続の再利用が可能になります。
   */
  public static getInstance(): PrismaClient {
    if (!PrismaClientWrapper.instance) {
      try {
        const adapter = new PrismaMariaDb({
          host: "localhost",
          port: 3306,
          connectionLimit: 5,
        });
        PrismaClientWrapper.instance = new PrismaClient({ adapter });
      } catch (err: unknown) {
        throw new DbError("DB接続に失敗しました", { cause: err });
      }
    }
    return PrismaClientWrapper.instance;
  }
}
