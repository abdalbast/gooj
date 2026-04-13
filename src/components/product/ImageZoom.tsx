import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useBodyScrollLock,
  useEscapeKey,
  useFocusRestore,
  useInitialFocus,
} from "@/hooks/use-overlay-accessibility";

interface ImageZoomProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageZoom = ({ images, initialIndex, isOpen, onClose }: ImageZoomProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogTitleId = useId();

  useBodyScrollLock(isOpen);
  useEscapeKey(isOpen, onClose);
  useFocusRestore(isOpen);
  useInitialFocus(isOpen, closeButtonRef);

  // Scroll to the selected image when modal opens
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const imageElement = scrollRef.current.children[0]?.children[initialIndex] as HTMLElement;
      if (imageElement) {
        imageElement.scrollIntoView();
      }
    }
  }, [isOpen, initialIndex]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogTitleId}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm animate-fade-in"
    >
      <h2 id={dialogTitleId} className="sr-only">
        Product image gallery
      </h2>
      {/* Backdrop */}
      <div
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      {/* Close button */}
      <Button
        ref={closeButtonRef}
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute right-6 top-[calc(1.5rem+var(--safe-area-top))] z-10 flex h-11 w-11 items-center justify-center border-none p-0 text-white hover:bg-white/10"
        aria-label="Close image gallery"
      >
        <X className="h-8 w-8" />
      </Button>

      {/* Scrollable image container */}
      <div
        ref={scrollRef}
        className="relative h-full w-full overflow-y-auto pb-[var(--safe-area-bottom)] pt-[var(--safe-area-top)] touch-scroll"
      >
        <div className="space-y-4">
          {images.map((image, index) => (
            <div key={index} className="w-full flex justify-center">
              <img
                src={image}
                alt={`Product view ${index + 1}`}
                loading={index === initialIndex ? "eager" : "lazy"}
                decoding="async"
                sizes="100vw"
                className="w-full max-w-none object-cover animate-scale-in"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageZoom;
