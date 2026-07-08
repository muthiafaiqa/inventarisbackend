import "reflect-metadata";
import "@/modules/inventory/infrastructure/Inventory.registry.js";
import "@/modules/sales/infrastructure/Sales.registry.js";
import "@/modules/forecasting/infrastructure/Forecasting.registry.js";
import "@/modules/user/infrastructure/User.registry.js";
import express from "express";
import { ProductController } from "@/modules/inventory/infrastructure/http/ProductController.js";
import { InventoryController } from "@/modules/inventory/infrastructure/http/InventoryController.js";
import { SalesController } from "@/modules/sales/infrastructure/http/SalesController.js";
import { ForecastingController } from "@/modules/forecasting/infrastructure/http/ForecastingController.js";
import { AuthController } from "@/modules/user/infrastructure/http/AuthController.js";
import { validateRequest } from "@/infrastructure/http/middleware/validateRequest.js";
import { authMiddleware } from "@/infrastructure/http/middleware/authMiddleware.js";
import { createProductSchema } from "@/modules/inventory/application/dtos/CreateProductDto.js";
import { updateProductSchema } from "@/modules/inventory/application/dtos/UpdateProductDto.js";
import { deleteProductSchema } from "@/modules/inventory/application/dtos/DeleteProductDto.js";
import { addStockSchema } from "@/modules/inventory/application/dtos/AddStockDto.js";
import { createTransactionSchema } from "@/modules/sales/application/dtos/CreateTransactionDto.js";
import { getForecastSchema } from "@/modules/forecasting/application/dtos/GetForecastDto.js";
import { registerUserSchema } from "@/modules/user/application/dtos/RegisterUserDto.js";
import { loginUserSchema } from "@/modules/user/application/dtos/LoginUserDto.js";
import { errorMiddleware } from "@/infrastructure/http/middleware/error.middleware.js";

const app = express();

app.use(express.json());

// Register Auth Routes
app.post(
  "/api/auth/register",
  validateRequest(registerUserSchema),
  AuthController.register
);

app.post(
  "/api/auth/login",
  validateRequest(loginUserSchema),
  AuthController.login
);

// Register Product Routes
app.post(
  "/api/products",
  authMiddleware,
  validateRequest(createProductSchema),
  ProductController.create
);


app.get(
  "/api/products",
  ProductController.getAll
);

app.put(
  "/api/products/:id",
  authMiddleware,
  validateRequest(updateProductSchema),
  ProductController.update
);

app.delete(
  "/api/products/:id",
  authMiddleware,
  validateRequest(deleteProductSchema),
  ProductController.delete
);

app.post(
  "/api/inventory/add-stock",
  authMiddleware,
  validateRequest(addStockSchema),
  InventoryController.addStock
);

// Register Transaction Routes
app.post(
  "/api/transactions",
  authMiddleware,
  validateRequest(createTransactionSchema),
  SalesController.create
);

app.get(
  "/api/transactions/history",
  authMiddleware,
  SalesController.getAll
);

// Register Forecasting Routes
app.get(
  "/api/forecasting/predict/:product_id",
  authMiddleware,
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
