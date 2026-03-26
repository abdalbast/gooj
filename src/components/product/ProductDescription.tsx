import { useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReviewProduct from "./ReviewProduct";
import { getProduct } from "@/lib/productData";
import {
  formatShippingPrice,
  SHIPPING_OPTIONS,
} from "@/lib/commerce";

const CustomStar = ({ filled, className }: { filled: boolean; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 ${filled ? 'text-foreground' : 'text-muted-foreground/30'} ${className}`}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
  </svg>
);

const ProductDescription = () => {
  const { productId } = useParams();
  const product = getProduct(productId || "1");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  return (
    <div className="space-y-0 mt-8 border-t border-border">
      <div className="border-b border-border">
        <Button variant="ghost" onClick={() => setIsDescriptionOpen(!isDescriptionOpen)} className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none">
          <span>Description</span>
          {isDescriptionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isDescriptionOpen && (
          <div className="pb-6 space-y-4">
            <p className="text-sm font-light text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>

      <div className="border-b border-border">
        <Button variant="ghost" onClick={() => setIsDetailsOpen(!isDetailsOpen)} className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none">
          <span>Box Details</span>
          {isDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isDetailsOpen && (
          <div className="pb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">SKU</span>
              <span className="text-sm font-light text-foreground">{product.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">Occasion</span>
              <span className="text-sm font-light text-foreground">{product.occasion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">Box Material</span>
              <span className="text-sm font-light text-foreground">{product.boxMaterial}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">Box Size</span>
              <span className="text-sm font-light text-foreground">{product.boxSize}</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-border">
        <Button variant="ghost" onClick={() => setIsDeliveryOpen(!isDeliveryOpen)} className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none">
          <span>Delivery & Returns</span>
          {isDeliveryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isDeliveryOpen && (
          <div className="pb-6 space-y-4">
            <ul className="space-y-2">
              <li className="text-sm font-light text-muted-foreground">• {formatShippingPrice("standard")} UK standard delivery</li>
              <li className="text-sm font-light text-muted-foreground">• Standard delivery: {SHIPPING_OPTIONS.standard.deliveryWindow}</li>
              <li className="text-sm font-light text-muted-foreground">• Express delivery: {formatShippingPrice("express")} ({SHIPPING_OPTIONS.express.deliveryWindow})</li>
              <li className="text-sm font-light text-muted-foreground">• Overnight delivery: {formatShippingPrice("overnight")} ({SHIPPING_OPTIONS.overnight.deliveryWindow})</li>
              <li className="text-sm font-light text-muted-foreground">• 14-day returns on non-personalised items</li>
              <li className="text-sm font-light text-muted-foreground">• Personalised items are non-refundable</li>
            </ul>
          </div>
        )}
      </div>

      <div className="border-b border-border lg:mb-16">
        <Button variant="ghost" onClick={() => setIsReviewsOpen(!isReviewsOpen)} className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none">
          <div className="flex items-center gap-3">
            <span>Customer Reviews</span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (<CustomStar key={star} filled={star <= 4.8} />))}
              <span className="text-sm font-light text-muted-foreground ml-1">4.8</span>
            </div>
          </div>
          {isReviewsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isReviewsOpen && (
          <div className="pb-6 space-y-6">
            <ReviewProduct />
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">{[1, 2, 3, 4, 5].map((star) => (<CustomStar key={star} filled={true} />))}</div>
                  <span className="text-sm font-light text-muted-foreground">James P.</span>
                </div>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  "Absolute lifesaver. Ordered this for my girlfriend's birthday and she was over the moon. The presentation is incredible and everything inside was top quality. Will definitely be back."
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">{[1, 2, 3, 4, 5].map((star) => (<CustomStar key={star} filled={star <= 4} />))}</div>
                  <span className="text-sm font-light text-muted-foreground">Mark S.</span>
                </div>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  "Got this for my mum and she loved it. The handwritten note was a nice personal touch. Only wish the box was a bit bigger but the contents were spot on."
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">{[1, 2, 3, 4, 5].map((star) => (<CustomStar key={star} filled={true} />))}</div>
                  <span className="text-sm font-light text-muted-foreground">Tom R.</span>
                </div>
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  "My wife said this was the most thoughtful gift I've ever got her. If she only knew how easy GOOJ made it. 10/10 would Gooj again."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
