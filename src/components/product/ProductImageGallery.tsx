import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";
import organicEarring from "@/assets/organic-earring.png";
import linkBracelet from "@/assets/link-bracelet.png";

const productImages = [
  pantheonImage,
  organicEarring,
  eclipseImage,
  linkBracelet,
  haloImage,
];

const ProductImageGallery = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="w-full">
      {/* Desktop/Tablet: Vertical scrolling gallery */}
      <div className="hidden md:block">
        <div className="space-y-4">
          {productImages.map((image, index) => (
            <div key={index} className="w-full aspect-square overflow-hidden">
              <img
                src={image}
                alt={`Product view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: Image slider */}
      <div className="md:hidden">
        <div className="relative">
          <div className="w-full aspect-square overflow-hidden">
            <img
              src={productImages[currentImageIndex]}
              alt={`Product view ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-black p-2 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-black p-2 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {/* Dots indicator */}
          <div className="flex justify-center mt-4 gap-2">
            {productImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-foreground' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;