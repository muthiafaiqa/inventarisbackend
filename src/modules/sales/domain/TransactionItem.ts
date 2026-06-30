export class TransactionItem {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly productId: string | null,
    public readonly productName: string, // Historical snapshot of product name
    public readonly pricePerUnit: number, // Historical snapshot of product price
    public readonly quantity: number
  ) {}
}
