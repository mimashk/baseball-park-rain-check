import { Prisma, PrismaClient } from "@prisma/client";
import { TransactionExecutor } from "../../../application/shared/interfaces/TransactionExecutor";
import { PrismaClientWrapper } from "./PrismaClientWrapper";
import { TransactionContext } from "../../../domain/shared/interfaces/TransactionContext";

type PrismaTx = Prisma.TransactionClient;

export class PrismaTransactionExecutor implements TransactionExecutor {
  private prisma: PrismaClient = PrismaClientWrapper.getInstance();

  async run<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(
      (tx: PrismaTx) => fn(tx as unknown as TransactionContext),
      { maxWait: 120_000, timeout: 1_200_000 }
    );
  }
}
