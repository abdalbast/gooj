import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export interface ProductCardProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  isNew?: boolean;
}

interface ProductCardProps {
  product: ProductCardProduct;
  hoverImage?: string;
  eager?: boolean;
}

const ProductCard = ({ product, hoverImage, eager = false }: ProductCardProps) => {
  const [showHoverImage, setShowHoverImage] = useState(false);
  const loadingPriority = eager ? { fetchpriority: "high" as const } : undefined;

  const revealHoverImage = () => {
    if (hoverImage) {
      setShowHoverImage(true);
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="block group"
      onMouseEnter={revealHoverImage}
      onFocus={revealHoverImage}
      onTouchStart={revealHoverImage}
    >
      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="p-0">
          <div className="relative mb-3 aspect-square overflow-hidden bg-muted/10">
            <img
              src={product.image}
              alt={product.name}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              {...loadingPriority}
              className={`h-full w-full object-cover transition-all duration-300 ${
                showHoverImage ? "group-hover:opacity-0 group-focus-within:opacity-0" : ""
              }`}
            />
            {showHoverImage && hoverImage ? (
              <img
                src={hoverImage}
                alt={`${product.name} lifestyle`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
              />
            ) : null}
            <div className="absolute inset-0 bg-black/[0.03]" />
            {product.isNew ? (
              <div className="absolute left-2 top-2 px-2 py-1 text-xs font-medium text-black">
                NEW
              </div>
            ) : null}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-light text-foreground">{product.category}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
              <p className="text-sm font-light text-foreground">{product.price}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;
