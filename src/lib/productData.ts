import pantheonImage from "@/assets/pantheon.webp";
import eclipseImage from "@/assets/eclipse.webp";
import haloImage from "@/assets/halo.webp";
import obliqueImage from "@/assets/oblique.webp";
import lintelImage from "@/assets/lintel.webp";
import shadowlineImage from "@/assets/shadowline.webp";

export interface ProductData {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string;
  whatsInside: string[];
  boxSize: string;
  personalisationOptions: string;
  editorsNote: string;
  occasion: string;
  boxMaterial: string;
  sku: string;
}

export const products: Record<string, ProductData> = {
  "1": {
    id: 1, name: "The Birthday Box", category: "Gift Boxes", price: "£65",
    image: pantheonImage,
    description: "A beautifully curated box of birthday treats designed to make her day unforgettable. From luxurious skincare to artisan chocolates and a keepsake candle, every item has been hand-selected to say 'Happy Birthday' without you having to find the words.",
    whatsInside: ["Artisan chocolate truffles", "Luxury hand cream", "Scented soy candle", "Birthday card with envelope", "Silk scrunchie"],
    boxSize: "30cm × 25cm × 12cm", personalisationOptions: "Photo frame insert, handwritten message card",
    editorsNote: "Our best-seller — because birthdays should never be stressful. Gooj it.",
    occasion: "Birthday", boxMaterial: "Recycled kraft with ribbon", sku: "GOOJ-BDAY-001"
  },
  "2": {
    id: 2, name: "The Anniversary Box", category: "Gift Boxes", price: "£85",
    image: eclipseImage,
    description: "Mark the milestone with a curated collection of romantic indulgences. This box pairs premium prosecco truffles with a rose-scented candle, a photo frame for your favourite memory together, and a luxurious silk eye mask for lazy Sunday mornings.",
    whatsInside: ["Prosecco truffles", "Rose-scented candle", "Wooden photo frame", "Silk eye mask", "Anniversary card"],
    boxSize: "32cm × 28cm × 14cm", personalisationOptions: "Engraved photo frame, custom message card",
    editorsNote: "Romance without the panic. You remembered, and that's what counts.",
    occasion: "Anniversary", boxMaterial: "Black matte box with gold foil", sku: "GOOJ-ANNI-001"
  },
  "3": {
    id: 3, name: "The Mum Box", category: "Gift Boxes", price: "£55",
    image: haloImage,
    description: "Because mums deserve more than a last-minute card from the petrol station. This box is packed with pampering essentials — from a nourishing bath soak to a gorgeous ceramic mug and premium loose-leaf tea.",
    whatsInside: ["Luxury bath soak", "Ceramic mug", "Loose-leaf tea", "Shortbread biscuits", "Thank You Mum card"],
    boxSize: "28cm × 22cm × 10cm", personalisationOptions: "Photo insert, handwritten note",
    editorsNote: "She'll love it. And she'll love that you thought of her.",
    occasion: "Mother's Day / Birthday", boxMaterial: "Blush pink box with tissue", sku: "GOOJ-MUM-001"
  },
  "4": {
    id: 4, name: "The Just Because Box", category: "Gift Boxes", price: "£45",
    image: obliqueImage,
    description: "No occasion needed. Sometimes the best gifts arrive when they're least expected. A compact but thoughtful selection of treats that says 'I was thinking of you' — and means it.",
    whatsInside: ["Mini scented candle", "Gourmet chocolate bar", "Moisturising hand cream", "Thinking of You card"],
    boxSize: "24cm × 18cm × 8cm", personalisationOptions: "Handwritten message card",
    editorsNote: "The 'just because' move. Tactical. Effective. Appreciated.",
    occasion: "Any", boxMaterial: "Natural kraft with twine", sku: "GOOJ-JUST-001"
  },
  "5": {
    id: 5, name: "The Luxury Box", category: "Luxury Boxes", price: "£120",
    image: lintelImage,
    description: "When you need to go big. This premium box is loaded with indulgent treats and keepsake items — from cashmere socks to a premium diffuser and artisan fudge. The unboxing experience alone is worth the price.",
    whatsInside: ["Cashmere-blend socks", "Reed diffuser", "Artisan fudge selection", "Luxury body oil", "Keepsake jewellery dish", "Premium gift card"],
    boxSize: "35cm × 30cm × 16cm", personalisationOptions: "Engraved jewellery dish, photo frame, custom message",
    editorsNote: "The nuclear option. When a bunch of flowers simply won't cut it.",
    occasion: "Special Occasion", boxMaterial: "Premium magnetic close box", sku: "GOOJ-LUX-001"
  },
  "6": {
    id: 6, name: "The Partner Box", category: "Gift Boxes", price: "£75",
    image: shadowlineImage,
    description: "Curated for the woman in your life. A romantic mix of self-care treats and sweet indulgences, wrapped up in a box that does the talking for you.",
    whatsInside: ["Scented candle", "Bath bomb duo", "Gourmet brownie bites", "Silk hair tie set", "Love note card"],
    boxSize: "30cm × 25cm × 12cm", personalisationOptions: "Photo frame insert, handwritten message",
    editorsNote: "Brownie points. Literally. She'll appreciate the effort (and the brownies).",
    occasion: "For Partner", boxMaterial: "Deep red box with satin ribbon", sku: "GOOJ-PART-001"
  }
};

export const getProduct = (id: string): ProductData => {
  return products[id] || products["1"];
};
