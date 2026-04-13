import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import ResponsivePicture from "@/components/ui/ResponsivePicture";

export interface ProductCardProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  imageAvif?: string;
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
  const [canUseHoverImage, setCanUseHoverImage] = useState(false);
  const loadingPriority = eager ? { fetchpriority: "high" as const } : undefined;

  useEffect(() => {
    if (!hoverImage || typeof window === "undefined" || typeof window.matchMedia !== "function") {
      setCanUseHoverImage(false);
      setShowHoverImage(false);
      return;
    }

    const hoverMediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateHoverPreference = () => {
      const supportsHoverImage = hoverMediaQuery.matches;
      setCanUseHoverImage(supportsHoverImage);

      if (!supportsHoverImage) {
        setShowHoverImage(false);
      }
    };

    updateHoverPreference();

    if (typeof hoverMediaQuery.addEventListener === "function") {
      hoverMediaQuery.addEventListener("change", updateHoverPreference);
      return () => hoverMediaQuery.removeEventListener("change", updateHoverPreference);
    }

    hoverMediaQuery.addListener(updateHoverPreference);
    return () => hoverMediaQuery.removeListener(updateHoverPreference);
  }, [hoverImage]);

  const revealHoverImage = () => {
    if (canUseHoverImage) {
      setShowHoverImage(true);
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="block group"
      onMouseEnter={revealHoverImage}
      onFocus={revealHoverImage}
    >
      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="p-0">
          <div className="relative mb-3 aspect-square overflow-hidden bg-muted/10">
            <ResponsivePicture
              avifSrc={product.imageAvif}
              src={product.image}
              alt={product.name}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              pictureClassName="block h-full w-full"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              {...loadingPriority}
              className={`h-full w-full object-cover transition-all duration-300 ${
                showHoverImage ? "group-hover:opacity-0 group-focus-within:opacity-0" : ""
              }`}
            />
            {showHoverImage && hoverImage && canUseHoverImage ? (
              <img
                src={hoverImage}
                alt={`${product.name} lifestyle`}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
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
