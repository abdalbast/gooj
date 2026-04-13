import { useEffect, useMemo, useRef, useState } from "react";
import { Crop, Maximize2, Move, RefreshCcw, Scan } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ProductPhotoCropDialogProps {
  file: File | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (file: File) => void;
}

const OUTPUT_SIZE = 1200;
const DEFAULT_VIEWPORT_SIZE = 320;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const ProductPhotoCropDialog = ({
  file,
  open,
  onOpenChange,
  onApply,
}: ProductPhotoCropDialogProps) => {
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });
  const [viewportSize, setViewportSize] = useState(DEFAULT_VIEWPORT_SIZE);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [frameMode, setFrameMode] = useState<"fill" | "fit">("fill");
  const [isSaving, setIsSaving] = useState(false);
  const dragStateRef = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!file) {
      setSourceUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setSourceUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file]);

  useEffect(() => {
    if (!viewportRef.current) {
      return;
    }

    const updateViewportSize = () => {
      setViewportSize(viewportRef.current?.clientWidth || DEFAULT_VIEWPORT_SIZE);
    };

    updateViewportSize();

    const observer = new ResizeObserver(updateViewportSize);
    observer.observe(viewportRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const baseScale = useMemo(
    () =>
      frameMode === "fill"
        ? Math.max(viewportSize / naturalSize.width, viewportSize / naturalSize.height)
        : Math.min(viewportSize / naturalSize.width, viewportSize / naturalSize.height),
    [frameMode, naturalSize.height, naturalSize.width, viewportSize],
  );

  const displaySize = useMemo(
    () => ({
      width: naturalSize.width * baseScale * zoom,
      height: naturalSize.height * baseScale * zoom,
    }),
    [baseScale, naturalSize.height, naturalSize.width, zoom],
  );

  const maxOffset = useMemo(
    () => ({
      x: Math.abs(displaySize.width - viewportSize) / 2,
      y: Math.abs(displaySize.height - viewportSize) / 2,
    }),
    [displaySize.height, displaySize.width, viewportSize],
  );

  useEffect(() => {
    setPosition((current) => ({
      x: clamp(current.x, -maxOffset.x, maxOffset.x),
      y: clamp(current.y, -maxOffset.y, maxOffset.y),
    }));
  }, [maxOffset.x, maxOffset.y]);

  useEffect(() => {
    if (!open) {
      setFrameMode("fill");
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsSaving(false);
    }
  }, [open]);

  const resetCrop = (nextMode = frameMode) => {
    setFrameMode(nextMode);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    setNaturalSize({
      width: image.naturalWidth,
      height: image.naturalHeight,
    });
    resetCrop("fill");
  };

  const updatePosition = (nextX: number, nextY: number) => {
    setPosition({
      x: clamp(nextX, -maxOffset.x, maxOffset.x),
      y: clamp(nextY, -maxOffset.y, maxOffset.y),
    });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      x: position.x,
      y: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current) {
      return;
    }

    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;
    updatePosition(dragStateRef.current.x + deltaX, dragStateRef.current.y + deltaY);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleApply = async () => {
    if (!file || !sourceUrl) {
      return;
    }

    setIsSaving(true);

    const image = new Image();
    image.src = sourceUrl;
    await image.decode();

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext("2d");

    if (!context) {
      setIsSaving(false);
      return;
    }

    const gradient = context.createLinearGradient(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#f3f3f1");
    context.fillStyle = gradient;
    context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const exportScale = OUTPUT_SIZE / viewportSize;
    const drawWidth = displaySize.width * exportScale;
    const drawHeight = displaySize.height * exportScale;
    const drawX = ((viewportSize - displaySize.width) / 2 + position.x) * exportScale;
    const drawY = ((viewportSize - displaySize.height) / 2 + position.y) * exportScale;

    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    if (!blob) {
      setIsSaving(false);
      return;
    }

    const croppedFile = new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-cropped.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    onApply(croppedFile);
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem-var(--safe-area-top)-var(--safe-area-bottom))] max-w-[94vw] overflow-y-auto border border-border/80 bg-background p-0 shadow-[0_24px_80px_rgba(0,0,0,0.12)] sm:max-w-4xl !rounded-none">
        <DialogHeader className="border-b border-border px-6 py-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 border border-border bg-muted/40 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              <Crop className="h-3.5 w-3.5" />
              Photo cropper
            </span>
            <span className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-foreground transition-colors">
              <Move className="h-3.5 w-3.5" />
              Drag to frame
            </span>
          </div>
          <DialogTitle className="font-light text-xl">Frame the photo exactly how it should appear</DialogTitle>
          <DialogDescription>
            Choose whether the insert should fill the frame or keep the whole image visible, then fine-tune it with drag and zoom.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border-b border-border bg-[linear-gradient(180deg,rgba(0,0,0,0.02),transparent)] p-6 lg:border-b-0 lg:border-r">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-light text-foreground">Live preview</p>
                  <p className="text-xs font-light text-muted-foreground">
                    The square area shows exactly what will be printed.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "rounded-none border-border px-3 transition-all duration-200 hover:-translate-y-px hover:bg-background active:translate-y-0",
                      frameMode === "fill" && "bg-foreground text-background hover:bg-foreground/90 hover:text-background",
                    )}
                    aria-pressed={frameMode === "fill"}
                    onClick={() => resetCrop("fill")}
                  >
                    <Maximize2 className="h-4 w-4" />
                    Fill frame
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "rounded-none border-border px-3 transition-all duration-200 hover:-translate-y-px hover:bg-background active:translate-y-0",
                      frameMode === "fit" && "bg-foreground text-background hover:bg-foreground/90 hover:text-background",
                    )}
                    aria-pressed={frameMode === "fit"}
                    onClick={() => resetCrop("fit")}
                  >
                    <Scan className="h-4 w-4" />
                    Fit entirely
                  </Button>
                </div>
              </div>

              <div
                ref={viewportRef}
                className="relative mx-auto aspect-square w-full max-w-[440px] touch-none overflow-hidden border border-border bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95),rgba(244,244,242,0.92))] shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_28%,transparent_72%,rgba(0,0,0,0.04))]" />
                <div className="absolute inset-0 cursor-grab active:cursor-grabbing">
                  {sourceUrl ? (
                    <img
                      src={sourceUrl}
                      alt="Crop source"
                      onLoad={handleImageLoad}
                      draggable={false}
                      className="absolute max-w-none select-none transition-[width,height,left,top] duration-150 ease-out"
                      style={{
                        width: `${displaySize.width}px`,
                        height: `${displaySize.height}px`,
                        left: `calc(50% - ${displaySize.width / 2}px + ${position.x}px)`,
                        top: `calc(50% - ${displaySize.height / 2}px + ${position.y}px)`,
                      }}
                    />
                  ) : null}
                </div>

                <div className="pointer-events-none absolute inset-0 border-[10px] border-black/12" />
                <div className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l border-t border-foreground/60 transition-opacity duration-200" />
                <div className="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r border-t border-foreground/60 transition-opacity duration-200" />
                <div className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-b border-l border-foreground/60 transition-opacity duration-200" />
                <div className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b border-r border-foreground/60 transition-opacity duration-200" />

                <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="bg-background/85 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm">
                    {frameMode === "fill" ? "Cropped to fill" : "Entire photo visible"}
                  </span>
                  <span className="bg-background/85 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm">
                    {zoom.toFixed(1)}x zoom
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-light text-foreground">Fine adjustments</p>
                <div className="rounded-none border border-border bg-muted/20 p-4 transition-colors duration-200 hover:bg-muted/30">
                  <div className="mb-2 flex items-center justify-between text-xs font-light uppercase tracking-[0.18em] text-muted-foreground">
                    <span>Zoom</span>
                    <span>{zoom.toFixed(2)}x</span>
                  </div>
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.01}
                    onValueChange={([value]) => setZoom(value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-light text-foreground">Positioning</p>
                <div className="space-y-4 rounded-none border border-border bg-background p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-light uppercase tracking-[0.18em] text-muted-foreground">
                      <span>Horizontal</span>
                      <span>{Math.round(position.x)} px</span>
                    </div>
                    <Slider
                      value={[position.x]}
                      min={-maxOffset.x}
                      max={maxOffset.x}
                      step={1}
                      onValueChange={([value]) => updatePosition(value, position.y)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-light uppercase tracking-[0.18em] text-muted-foreground">
                      <span>Vertical</span>
                      <span>{Math.round(position.y)} px</span>
                    </div>
                    <Slider
                      value={[position.y]}
                      min={-maxOffset.y}
                      max={maxOffset.y}
                      step={1}
                      onValueChange={([value]) => updatePosition(position.x, value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-none transition-all duration-200 hover:-translate-y-px hover:bg-background active:translate-y-0"
                  onClick={() => resetCrop(frameMode)}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-none transition-all duration-200 hover:-translate-y-px active:translate-y-0"
                  onClick={() => resetCrop("fit")}
                >
                  <Scan className="h-4 w-4" />
                  Fit entirely
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 pb-[calc(1rem+var(--safe-area-bottom))] pt-4 sm:justify-between">
          <Button type="button" variant="ghost" className="rounded-none transition-all duration-200 hover:-translate-y-px active:translate-y-0" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="rounded-none transition-all duration-200 hover:-translate-y-px active:translate-y-0" onClick={handleApply} disabled={!file || isSaving}>
            {isSaving ? "Saving..." : "Use cropped photo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductPhotoCropDialog;
