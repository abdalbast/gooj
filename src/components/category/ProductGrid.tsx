import { useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";
import organicEarring from "@/assets/organic-earring.webp";
import linkBracelet from "@/assets/link-bracelet.webp";
import ProductCard from "@/components/product/ProductCard";
import type { CategoryProduct } from "./productData";

interface ProductGridProps {
  products: CategoryProduct[];
}

const PAGE_SIZE = 12;

const ProductGrid = ({ products: filteredProducts }: ProductGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedProducts = useMemo(
    () => filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, filteredProducts],
  );

  return (
    <section className="w-full px-6 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              hoverImage={product.id % 2 === 0 ? organicEarring : linkBracelet}
              eager={product.id <= 4}
            />
          ))}
        </div>

      {filteredProducts.length > PAGE_SIZE ? (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      ) : null}
    </section>
  );
};

export default ProductGrid;
