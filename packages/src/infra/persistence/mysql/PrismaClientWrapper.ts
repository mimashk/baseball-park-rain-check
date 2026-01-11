// Use the public Prisma client entrypoint (internal/class only exports types)
import { DbError } from "../../../shared/errors/DbError";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const required = (name: string) => {
  const v = process.env[name];
  if (!v) throw new DbError(`環境変数 ${name} が未設定です`);
  return v;
};

const toNumber = (name: string, def?: number) => {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return def;
  const num = Number(raw);
  if (Number.isNaN(num))
    throw new DbError(`環境変数 ${name} は数値で指定してください`);
  return num;
};
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
          host: required("DB_HOST"),
          port: toNumber("DB_PORT", 3306),
          user: required("DB_USER"),
          password: required("DB_PASSWORD"),
          database: required("DB_NAME"),
          connectionLimit: toNumber("DB_CONN_LIMIT", 5),
        });
        PrismaClientWrapper.instance = new PrismaClient({ adapter });
      } catch (err: unknown) {
        throw new DbError("DB接続に失敗しました", { cause: err });
      }
    }
    return PrismaClientWrapper.instance;
  }
}
