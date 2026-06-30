export interface SalesTransactionItemDto {
  id: string;
  transactionId: string;
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  transactionDate: Date;
}

export interface SalesHistoryDto {
  productId: string;
  date: Date; // Start of the period (day/week/month)
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface ISalesPublicApi {
  /**
   * Retrieves individual sales transaction items for a specific product within a date range.
   */
  getTransactionItemsByProduct(
    productId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SalesTransactionItemDto[]>;

  /**
   * Retrieves all individual sales transaction items within a date range.
   */
  getAllTransactionItems(
    startDate: Date,
    endDate: Date
  ): Promise<SalesTransactionItemDto[]>;

  /**
   * Retrieves aggregated historical sales volume (total quantity and revenue) for a product,
   * grouped by a specific period (e.g., 'daily', 'weekly', 'monthly').
   * This is directly used for Trend Moment calculations.
   */
  getAggregatedSalesHistory(
    productId: string,
    startDate: Date,
    endDate: Date,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<SalesHistoryDto[]>;
}
