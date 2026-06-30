import { inject, injectable } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { ITransactionRepository } from "../domain/ITransactionRepository.js";
import { Transaction } from "../domain/Transaction.js";

@injectable()
export class GetAllTransactions {
  constructor(
    @inject(TOKENS.TransactionRepository)
    private transactionRepository: ITransactionRepository
  ) {}

  async execute(): Promise<Transaction[]> {
    return this.transactionRepository.findAll();
  }
}
