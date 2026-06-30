export interface ProductStockDto {
  productId: string;
  sku: string;
  name: string;
  price: number;
  currentStock: number;
  minStock: number;
  unit: string;
}

export interface StockMovementDto {
  id: string;
  productId: string;
  quantity: number; // Positive for incoming/adjustments, negative for outgoing
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  referenceId?: string; // Links to transactionId or other module events
  notes?: string;
  createdAt: Date;
}

export interface IInventoryPublicApi {
  /**
   * Retrieves the stock information of a single product.
   */
  getProductStock(productId: string): Promise<ProductStockDto | null>;

  /**
   * Retrieves the stock information of all products.
   */
  getAllProductsStock(): Promise<ProductStockDto[]>;

  /**
   * Retrieves the historical stock movements of a specific product within a date range.
   */
  getStockMovementHistory(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StockMovementDto[]>;

  /**
   * Retrieves the historical stock movements of all products within a date range.
   */
  getAllStockMovementHistory(
    startDate: Date,
    endDate: Date
  ): Promise<StockMovementDto[]>;
}
