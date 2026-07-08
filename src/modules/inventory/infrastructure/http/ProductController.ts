import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { CreateProduct } from "@/modules/inventory/application/CreateProduct.js";
import { GetAllProducts } from "@/modules/inventory/application/GetAllProducts.js";
import { UpdateProduct } from "@/modules/inventory/application/UpdateProduct.js";
import { DeleteProduct } from "@/modules/inventory/application/DeleteProduct.js";
import { TOKENS } from "@/core/di/tokens.js";

export class ProductController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.resolve<CreateProduct>(TOKENS.CreateProduct);
      
      const { sku, nama, harga, unit, minStock } = req.body;
      
      const product = await useCase.execute({
        sku,
        name: nama,
        price: harga,
        unit,
        minStock,
      });

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: {
          id: product.id,
          productId: product.id,
          product_id: product.id,
          sku: product.sku,
          nama: product.name,
          name: product.name,
          harga: product.price,
          price: product.price,
          unit: product.unit,
          minStock: product.minStock,
          currentStock: 0,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.resolve<GetAllProducts>(TOKENS.GetAllProducts);
      const products = await useCase.execute();

      const inventoryPublicApi = container.resolve<any>(TOKENS.InventoryPublicApi);
      const stocks = await inventoryPublicApi.getAllProductsStock();

      const mapped = products.map((product) => {
        const stockData = stocks.find((s: any) => s.productId === product.id);
        const currentStock = stockData ? stockData.currentStock : 0;
        return {
          id: product.id,
          productId: product.id,
          product_id: product.id,
          sku: product.sku,
          nama: product.name,
          name: product.name,
          harga: product.price,
          price: product.price,
          unit: product.unit,
          minStock: product.minStock,
          currentStock,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        };
      });

      res.status(200).json({
        success: true,
        data: mapped,
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.resolve<UpdateProduct>(TOKENS.UpdateProduct);
      const id = req.params.id as string;
      const { sku, nama, harga, unit, minStock } = req.body;

      const product = await useCase.execute({
        id,
        sku,
        name: nama,
        price: harga,
        unit,
        minStock,
      });

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: {
          id: product.id,
          productId: product.id,
          product_id: product.id,
          sku: product.sku,
          nama: product.name,
          name: product.name,
          harga: product.price,
          price: product.price,
          unit: product.unit,
          minStock: product.minStock,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = container.resolve<DeleteProduct>(TOKENS.DeleteProduct);
      const id = req.params.id as string;

      await useCase.execute(id);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      next(error);
    }
  }
}
