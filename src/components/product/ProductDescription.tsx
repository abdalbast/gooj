import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProductDescription = () => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCareOpen, setIsCareOpen] = useState(false);

  return (
    <div className="space-y-0 mt-8 border-t border-border">
      {/* Description */}
      <div className="border-b border-border">
        <Button
          variant="ghost"
          onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <span>Description</span>
          {isDescriptionOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {isDescriptionOpen && (
          <div className="pb-6 space-y-4">
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              The Pantheon earrings embody architectural elegance with their clean, geometric design. 
              Inspired by classical Roman architecture, these statement pieces feature a sophisticated 
              interplay of curves and angles that catch and reflect light beautifully.
            </p>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Each earring is meticulously crafted from premium sterling silver with an 18k gold 
              plating, ensuring both durability and luxury. The minimalist aesthetic makes them 
              perfect for both everyday wear and special occasions.
            </p>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="border-b border-border">
        <Button
          variant="ghost"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <span>Product Details</span>
          {isDetailsOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {isDetailsOpen && (
          <div className="pb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">SKU</span>
              <span className="text-sm font-light text-foreground">LE-PTH-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">Collection</span>
              <span className="text-sm font-light text-foreground">Architectural Series</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">Closure</span>
              <span className="text-sm font-light text-foreground">Post and butterfly back</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">Hypoallergenic</span>
              <span className="text-sm font-light text-foreground">Yes</span>
            </div>
          </div>
        )}
      </div>

      {/* Care Instructions */}
      <div>
        <Button
          variant="ghost"
          onClick={() => setIsCareOpen(!isCareOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <span>Care & Cleaning</span>
          {isCareOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {isCareOpen && (
          <div className="pb-6 space-y-4">
            <ul className="space-y-2">
              <li className="text-sm font-light text-muted-foreground">• Clean with a soft, dry cloth after each wear</li>
              <li className="text-sm font-light text-muted-foreground">• Avoid contact with perfumes, lotions, and cleaning products</li>
              <li className="text-sm font-light text-muted-foreground">• Store in the provided jewelry pouch when not wearing</li>
              <li className="text-sm font-light text-muted-foreground">• Remove before swimming, exercising, or showering</li>
            </ul>
            <p className="text-sm font-light text-muted-foreground">
              For professional cleaning, visit your local jeweler or contact our customer service team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;