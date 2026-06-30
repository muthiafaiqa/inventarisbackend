export class Product {
  constructor(
    public readonly id: string,
    public sku: string,
    public name: string,
    public price: number,
    public unit: string,
    public minStock: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
