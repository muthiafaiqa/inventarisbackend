import "reflect-metadata";
import "@/modules/inventory/infrastructure/Inventory.registry.js";
import "@/modules/sales/infrastructure/Sales.registry.js";
import "@/modules/forecasting/infrastructure/Forecasting.registry.js";
import express from "express";
import { ProductController } from "@/modules/inventory/infrastructure/http/ProductController.js";
import { InventoryController } from "@/modules/inventory/infrastructure/http/InventoryController.js";
import { SalesController } from "@/modules/sales/infrastructure/http/SalesController.js";
import { ForecastingController } from "@/modules/forecasting/infrastructure/http/ForecastingController.js";
import { validateRequest } from "@/infrastructure/http/middleware/validateRequest.js";
import { createProductSchema } from "@/modules/inventory/application/dtos/CreateProductDto.js";
import { updateProductSchema } from "@/modules/inventory/application/dtos/UpdateProductDto.js";
import { deleteProductSchema } from "@/modules/inventory/application/dtos/DeleteProductDto.js";
import { addStockSchema } from "@/modules/inventory/application/dtos/AddStockDto.js";
import { createTransactionSchema } from "@/modules/sales/application/dtos/CreateTransactionDto.js";
import { getForecastSchema } from "@/modules/forecasting/application/dtos/GetForecastDto.js";
import { errorMiddleware } from "@/infrastructure/http/middleware/error.middleware.js";

const app = express();

app.use(express.json());

// Register Product Routes
app.post(
  "/api/products",
  validateRequest(createProductSchema),
  ProductController.create
);


app.get(
  "/api/products",
  ProductController.getAll
);

app.put(
  "/api/products/:id",
  validateRequest(updateProductSchema),
  ProductController.update
);

app.delete(
  "/api/products/:id",
  validateRequest(deleteProductSchema),
  ProductController.delete
);

app.post(
  "/api/inventory/add-stock",
  validateRequest(addStockSchema),
  InventoryController.addStock
);

// Register Transaction Routes
app.post(
  "/api/transactions",
  validateRequest(createTransactionSchema),
  SalesController.create
);

app.get(
  "/api/transactions/history",
  SalesController.getAll
);

// Register Forecasting Routes
app.get(
  "/api/forecasting/predict/:product_id",
  validateRequest(getForecastSchema),
  ForecastingController.predict
);

// Global Error Handler Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { app };
