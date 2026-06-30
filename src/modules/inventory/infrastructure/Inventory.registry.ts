import { registry } from "tsyringe";
import { TOKENS } from "@/core/di/tokens.js";
import { PrismaProductRepository } from "@/modules/inventory/infrastructure/db/PrismaProductRepository.js";
import { CreateProduct } from "@/modules/inventory/application/CreateProduct.js";
import { GetAllProducts } from "@/modules/inventory/application/GetAllProducts.js";
import { InventoryPublicApi } from "@/modules/inventory/public/InventoryPublicApi.js";
import { AddStock } from "@/modules/inventory/application/AddStock.js";
import { UpdateProduct } from "@/modules/inventory/application/UpdateProduct.js";
import { DeleteProduct } from "@/modules/inventory/application/DeleteProduct.js";

@registry([
  {
    token: TOKENS.ProductRepository,
    useClass: PrismaProductRepository,
  },
  {
    token: TOKENS.CreateProduct,
    useClass: CreateProduct,
  },
  {
    token: TOKENS.GetAllProducts,
    useClass: GetAllProducts,
  },
  {
    token: TOKENS.InventoryPublicApi,
    useClass: InventoryPublicApi,
  },
  {
    token: TOKENS.AddStock,
    useClass: AddStock,
  },
  {
    token: TOKENS.UpdateProduct,
    useClass: UpdateProduct,
  },
  {
    token: TOKENS.DeleteProduct,
    useClass: DeleteProduct,
  },
])
export class InventoryRegistry {}
