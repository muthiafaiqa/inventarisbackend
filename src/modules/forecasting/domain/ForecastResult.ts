export class ForecastResult {
  constructor(
    public readonly productId: string,
    public readonly a: number,
    public readonly b: number,
    public readonly mape: number,
    public readonly forecastValue: number
  ) {}
}
