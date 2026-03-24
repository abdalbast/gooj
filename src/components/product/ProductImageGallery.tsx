import { useEffect, useState } from "react";
import ImageZoom from "./ImageZoom";
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";
import organicEarring from "@/assets/organic-earring.png";
import linkBracelet from "@/assets/link-bracelet.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type ProductMediaItem = {
  type: "image" | "video";
  src: string;
  alt: string;
};

const productMedia: ProductMediaItem[] = [
  { type: "image", src: pantheonImage, alt: "Product view 1" },
  { type: "image", src: organicEarring, alt: "Product view 2" },
  { type: "image", src: eclipseImage, alt: "Product view 3" },
  { type: "image", src: linkBracelet, alt: "Product view 4" },
  { type: "image", src: haloImage, alt: "Product view 5" },
];

const imageMedia = productMedia.filter((media) => media.type === "image");

const ProductImageGallery = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomInitialIndex, setZoomInitialIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }

    const syncCurrentSlide = () => {
      setCurrentImageIndex(api.selectedScrollSnap());
    };

    syncCurrentSlide();
    api.on("select", syncCurrentSlide);
    api.on("reInit", syncCurrentSlide);

    return () => {
      api.off("select", syncCurrentSlide);
      api.off("reInit", syncCurrentSlide);
    };
  }, [api]);

  const handleMediaClick = (index: number) => {
    if (productMedia[index]?.type !== "image") {
      return;
    }

    const imageIndex = productMedia
      .slice(0, index + 1)
      .filter((media) => media.type === "image").length - 1;

    setZoomInitialIndex(imageIndex);
    setIsZoomOpen(true);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: productMedia.length > 1 }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {productMedia.map((media, index) => (
              <CarouselItem key={media.src} className="pl-0">
                <div
                  className="group aspect-square w-full overflow-hidden bg-muted/20"
                  onClick={() => handleMediaClick(index)}
                >
                  {media.type === "image" ? (
                    <img
                      src={media.src}
                      alt={media.alt}
                      className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-105 select-none"
                    />
                  ) : (
                    <video
                      src={media.src}
                      className="h-full w-full object-cover"
                      controls
                      playsInline
                    />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {productMedia.length > 1 ? (
            <>
              <CarouselPrevious className="left-4 top-1/2 h-9 w-9 -translate-y-1/2 border-0 bg-background/85 shadow-sm hover:bg-background" />
              <CarouselNext className="right-4 top-1/2 h-9 w-9 -translate-y-1/2 border-0 bg-background/85 shadow-sm hover:bg-background" />
            </>
          ) : null}
        </Carousel>

        <div className="mt-4 flex justify-center gap-2">
          {productMedia.map((media, index) => (
            <button
              key={`${media.src}-${index}`}
              type="button"
              onClick={() => api?.scrollTo(index)}
              aria-label={`Go to ${media.type} ${index + 1}`}
              aria-current={index === currentImageIndex}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                index === currentImageIndex ? "bg-foreground" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <ImageZoom
        images={imageMedia.map((media) => media.src)}
        initialIndex={zoomInitialIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  );
};

export default ProductImageGallery;
