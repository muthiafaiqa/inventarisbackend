import { TransactionItem } from "./TransactionItem.js";

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly totalAmount: number,
    public readonly date: Date,
    public readonly items: TransactionItem[] = []
  ) {}
}
