import { inject, injectable } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { ISalesPublicApi } from "@/modules/sales/public/ISalesPublicApi.js";
import { IInventoryPublicApi } from "@/modules/inventory/public/IInventoryPublicApi.js";
import { ForecastResult } from "@/modules/forecasting/domain/ForecastResult.js";
import {
  InsufficientDataError,
  ProductNotFoundError,
} from "@/modules/forecasting/domain/errors/ForecastingErrors.js";

export interface CalculateProductForecastInput {
  productId: string;
  startDate?: Date;
  endDate?: Date;
  period?: "daily" | "weekly" | "monthly";
}

@injectable()
export class CalculateProductForecast {
  constructor(
    @inject(TOKENS.SalesPublicApi)
    private salesPublicApi: ISalesPublicApi,
    @inject(TOKENS.InventoryPublicApi)
    private inventoryPublicApi: IInventoryPublicApi
  ) {}

  async execute(input: CalculateProductForecastInput): Promise<ForecastResult> {
    // 1. Verify product exists
    const product = await this.inventoryPublicApi.getProductStock(input.productId);
    if (!product) {
      throw new ProductNotFoundError(input.productId);
    }

    // 2. Set defaults for dates and period
    const period = input.period || "monthly";
    const endDate = input.endDate || new Date();
    const startDate = input.startDate || this.getDefaultStartDate(period, endDate);

    // 3. Fetch aggregated sales history
    const history = await this.salesPublicApi.getAggregatedSalesHistory(
      input.productId,
      startDate,
      endDate,
      period
    );

    const n = history.length;
    if (n < 2) {
      throw new InsufficientDataError(
        input.productId,
        `Insufficient sales history to calculate forecast. Found ${n} data point(s), but at least 2 are required.`
      );
    }

    // 4. Calculate sums for Trend Moment (simple linear regression)
    // X_t = t (0, 1, 2, ..., n-1)
    // Y_t = totalQuantitySold
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let t = 0; t < n; t++) {
      const x = t;
      const y = history[t].totalQuantitySold;

      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    const denominator = n * sumX2 - Math.pow(sumX, 2);
    if (denominator === 0) {
      throw new InsufficientDataError(
        input.productId,
        "Cannot calculate forecast due to zero variance in period indices (denominator is zero)."
      );
    }

    // b = (n(ΣXY) - (ΣX)(ΣY)) / (n(ΣX²) - (ΣX)²)
    const b = (n * sumXY - sumX * sumY) / denominator;
    
    // a = (ΣY - b(ΣX)) / n
    const a = (sumY - b * sumX) / n;

    // 5. Calculate MAPE (Mean Absolute Percentage Error)
    // MAPE = (1/n) * Σ |(Actual_t - Forecast_t) / Actual_t| * 100
    let sumPercentageError = 0;
    let validMapeCount = 0;

    for (let t = 0; t < n; t++) {
      const actual = history[t].totalQuantitySold;
      const forecast = a + b * t;

      if (actual !== 0) {
        sumPercentageError += Math.abs((actual - forecast) / actual);
        validMapeCount++;
      }
    }

    const mape = validMapeCount > 0 ? (sumPercentageError / validMapeCount) * 100 : 0;

    // 6. Calculate forecast value for the next period (index t = n)
    const forecastValueRaw = a + b * n;
    const forecastValue = Math.max(0, forecastValueRaw); // Clamp to 0 since stock sales cannot be negative

    return new ForecastResult(input.productId, a, b, mape, forecastValue);
  }

  private getDefaultStartDate(period: "daily" | "weekly" | "monthly", endDate: Date): Date {
    const start = new Date(endDate);
    if (period === "daily") {
      start.setDate(start.getDate() - 30); // Last 30 days
    } else if (period === "weekly") {
      start.setDate(start.getDate() - 12 * 7); // Last 12 weeks
    } else {
      start.setMonth(start.getMonth() - 12); // Last 12 months
    }
    return start;
  }
}
