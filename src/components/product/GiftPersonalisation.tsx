import { useRef } from "react";
import { ImagePlus, X, PenLine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const maxChars = 200;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoChange(file);
    }
  };

  const removePhoto = () => {
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
          <div className="relative w-24 h-24">
            <img
              src={photoPreview}
              alt="Uploaded photo"
              className="w-full h-full object-cover border border-border"
            />
            <button
              onClick={removePhoto}
              className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-dashed border-border py-6 flex flex-col items-center gap-2 hover:border-foreground/50 transition-colors"
          >
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs font-light text-muted-foreground">
              JPG, PNG or WEBP
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
    </div>
  );
};

export default GiftPersonalisation;
