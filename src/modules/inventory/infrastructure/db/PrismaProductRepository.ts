import { IProductRepository } from "@/modules/inventory/domain/IProductRepository.js";
import { Product } from "@/modules/inventory/domain/Product.js";
import { prisma } from "@/infrastructure/db/prisma.js";

export class PrismaProductRepository implements IProductRepository {
  async save(product: Product): Promise<Product> {
    const created = await prisma.product.create({
      data: {
        id: product.id,
        sku: product.sku,
        nama: product.name,
        harga: product.price,
        unit: product.unit,
        minStock: product.minStock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<Product | null> {
    const raw = await prisma.product.findUnique({
      where: { id },
    });

    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const raw = await prisma.product.findUnique({
      where: { sku },
    });

    if (!raw) return null;
    return this.mapToDomain(raw);
  }

  async findAll(): Promise<Product[]> {
    const products = await prisma.product.findMany();
    return products.map((p) => this.mapToDomain(p));
  }

  async update(product: Product): Promise<Product> {
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        sku: product.sku,
        nama: product.name,
        harga: product.price,
        unit: product.unit,
        minStock: product.minStock,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.product.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  private mapToDomain(dbProduct: any): Product {
    return new Product(
      dbProduct.id,
      dbProduct.sku,
      dbProduct.nama,
      dbProduct.harga,
      dbProduct.unit,
      dbProduct.minStock,
      dbProduct.createdAt,
      dbProduct.updatedAt
    );
  }
}
