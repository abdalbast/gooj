import type { ProductData } from "./productData";
import { products } from "./productData";

export const getCatalogProduct = (productId: string): ProductData | null => {
  return products[productId] ?? null;
};

export const listCatalogProducts = () => {
  return Object.entries(products).map(([id, product]) => ({
    id,
    ...product,
  }));
};
