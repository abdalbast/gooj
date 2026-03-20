import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Minus, Plus } from "lucide-react";
import GiftPersonalisation from "./GiftPersonalisation";
import { getProduct } from "@/lib/productData";

const ProductInfo = () => {
  const { productId } = useParams();
  const product = getProduct(productId || "1");
  const [quantity, setQuantity] = useState(1);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [handwrittenNote, setHandwrittenNote] = useState(false);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const handlePhotoChange = (file: File | null) => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="space-y-6">
      <div className="hidden lg:block">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild><Link to="/category/gift-boxes">Gift Boxes</Link></BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-light text-muted-foreground mb-1">{product.category}</p>
            <h1 className="text-2xl md:text-3xl font-light text-foreground">{product.name}</h1>
          </div>
          <div className="text-right">
            <p className="text-xl font-light text-foreground">{product.price}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 py-4 border-b border-border">
        <div className="space-y-2">
          <h3 className="text-sm font-light text-foreground">What's Inside</h3>
          <ul className="space-y-1">
            {product.whatsInside.map((item, i) => (
              <li key={i} className="text-sm font-light text-muted-foreground">• {item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-light text-foreground">Box Size</h3>
          <p className="text-sm font-light text-muted-foreground">{product.boxSize}</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-light text-foreground">Personalisation Options</h3>
          <p className="text-sm font-light text-muted-foreground">{product.personalisationOptions}</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-light text-foreground">Editor's Notes</h3>
          <p className="text-sm font-light text-muted-foreground italic">"{product.editorsNote}"</p>
        </div>
      </div>

      <GiftPersonalisation
        photo={photo}
        photoPreview={photoPreview}
        message={message}
        handwrittenNote={handwrittenNote}
        onPhotoChange={handlePhotoChange}
        onMessageChange={setMessage}
        onHandwrittenNoteChange={setHandwrittenNote}
      />

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-light text-foreground">Quantity</span>
          <div className="flex items-center border border-border">
            <Button variant="ghost" size="sm" onClick={decrementQuantity} className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="h-10 flex items-center px-4 text-sm font-light min-w-12 justify-center border-l border-r border-border">{quantity}</span>
            <Button variant="ghost" size="sm" onClick={incrementQuantity} className="h-10 w-10 p-0 hover:bg-transparent hover:opacity-50 rounded-none border-none">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none">
          Add to Bag
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
