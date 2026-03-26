import { useRef, useState } from "react";
import { Crop, ImagePlus, RefreshCcw, X, PenLine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ProductPhotoCropDialog from "./ProductPhotoCropDialog";

interface GiftPersonalisationProps {
  photo: File | null;
  photoPreview: string | null;
  message: string;
  handwrittenNote: boolean;
  onPhotoChange: (file: File | null) => void;
  onMessageChange: (message: string) => void;
  onHandwrittenNoteChange: (checked: boolean) => void;
}

const GiftPersonalisation = ({
  photo,
  photoPreview,
  message,
  handwrittenNote,
  onPhotoChange,
  onMessageChange,
  onHandwrittenNoteChange,
}: GiftPersonalisationProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const maxChars = 200;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingPhoto(file);
      setIsCropOpen(true);
    }
  };

  const removePhoto = () => {
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleCropApply = (file: File) => {
    onPhotoChange(file);
    setPendingPhoto(null);
  };

  const handleCropOpenChange = (open: boolean) => {
    setIsCropOpen(open);
    if (!open) {
      setPendingPhoto(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-5 py-4 border-b border-border">
      <h3 className="text-sm font-light text-foreground flex items-center gap-2">
        <PenLine className="h-4 w-4" />
        Personalise Your Gift Box
      </h3>

      {/* Photo Upload */}
      <div className="space-y-2">
        <p className="text-sm font-light text-muted-foreground">Add a photo</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        {photoPreview ? (
          <div className="flex items-start gap-4">
            <div className="relative h-24 w-24 shrink-0">
              <img
                src={photoPreview}
                alt="Uploaded photo"
                loading="eager"
                decoding="async"
                sizes="96px"
                className="h-full w-full border border-border object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute -top-2 -right-2 flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-background transition-opacity hover:opacity-80"
                aria-label="Remove uploaded photo"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground">
                  <X className="h-3 w-3" />
                </span>
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-light text-muted-foreground">
                Your photo is cropped to fit the square frame insert.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="rounded-none" onClick={() => {
                  setPendingPhoto(photo);
                  setIsCropOpen(true);
                }} disabled={!photo}>
                  <Crop className="mr-2 h-4 w-4" />
                  Re-crop
                </Button>
                <Button type="button" variant="ghost" className="rounded-none" onClick={openFilePicker}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Replace photo
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openFilePicker}
            className="w-full border border-dashed border-border py-6 flex flex-col items-center gap-2 hover:border-foreground/50 transition-colors"
          >
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-light text-muted-foreground">
              JPG, PNG or WEBP
            </span>
            <span className="text-xs font-light text-muted-foreground/80">
              Upload, crop, and position your photo
            </span>
          </button>
        )}
      </div>

      {/* Personal Message */}
      <div className="space-y-2">
        <p className="text-sm font-light text-muted-foreground">Write a message</p>
        <Textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          maxLength={maxChars}
          placeholder="Write a heartfelt message..."
          className="rounded-none resize-none text-sm font-light min-h-[80px]"
        />
        <p className="text-xs font-light text-muted-foreground text-right">
          {message.length}/{maxChars}
        </p>
      </div>

      {/* Handwritten Note Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="handwritten"
          checked={handwrittenNote}
          onCheckedChange={(checked) => onHandwrittenNoteChange(checked === true)}
        />
        <Label
          htmlFor="handwritten"
          className="text-sm font-light text-foreground cursor-pointer"
        >
          Include a handwritten card (free)
        </Label>
      </div>

      <ProductPhotoCropDialog
        file={pendingPhoto}
        open={isCropOpen}
        onOpenChange={handleCropOpenChange}
        onApply={handleCropApply}
      />
    </div>
  );
};

export default GiftPersonalisation;
