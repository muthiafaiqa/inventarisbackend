import { registry } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { CalculateProductForecast } from "@/modules/forecasting/application/CalculateProductForecast.js";

@registry([
  {
    token: TOKENS.CalculateProductForecast,
    useClass: CalculateProductForecast,
  },
])
export class ForecastingRegistry {}
