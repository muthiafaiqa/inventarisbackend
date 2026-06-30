import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { CalculateProductForecast } from "@/modules/forecasting/application/CalculateProductForecast.js";
import { TOKENS } from "@/core/di/tokens.js";

export class ForecastingController {
  static async predict(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.resolve<CalculateProductForecast>(TOKENS.CalculateProductForecast);
      
      const productId = req.params.product_id as string;
      const { period, startDate, endDate } = req.query as any;

      const result = await useCase.execute({
        productId,
        startDate,
        endDate,
        period,
      });

      res.status(200).json({
        success: true,
        data: {
          productId: result.productId,
          a: result.a,
          b: result.b,
          mape: result.mape,
          forecastValue: result.forecastValue,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }
}
