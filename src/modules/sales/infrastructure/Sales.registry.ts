import { registry } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { PrismaTransactionRepository } from "@/modules/sales/infrastructure/db/PrismaTransactionRepository.js";
import { CreateTransaction } from "@/modules/sales/application/CreateTransaction.js";
import { GetAllTransactions } from "@/modules/sales/application/GetAllTransactions.js";
import { SalesPublicApi } from "@/modules/sales/public/SalesPublicApi.js";

@registry([
  {
    token: TOKENS.TransactionRepository,
    useClass: PrismaTransactionRepository,
  },
  {
    token: TOKENS.CreateTransaction,
    useClass: CreateTransaction,
  },
  {
    token: TOKENS.GetAllTransactions,
    useClass: GetAllTransactions,
  },
  {
    token: TOKENS.SalesPublicApi,
    useClass: SalesPublicApi,
  },
])
export class SalesRegistry {}
