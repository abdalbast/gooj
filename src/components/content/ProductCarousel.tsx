import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import pantheonImage from "@/assets/pantheon.webp";
import eclipseImage from "@/assets/eclipse.webp";
import haloImage from "@/assets/halo.webp";
import obliqueImage from "@/assets/oblique.webp";
import lintelImage from "@/assets/lintel.webp";
import shadowlineImage from "@/assets/shadowline.webp";
import organicEarring from "@/assets/organic-earring.webp";
import linkBracelet from "@/assets/link-bracelet.webp";
import ProductCard, { type ProductCardProduct } from "@/components/product/ProductCard";

interface ProductCarouselProps {
  id?: string;
}

const products: ProductCardProduct[] = [
  {
    id: 1,
    name: "The Birthday Box",
    category: "Gift Boxes",
    price: "£65",
    image: pantheonImage,
    isNew: true,
  },
  {
    id: 2,
    name: "The Anniversary Box",
    category: "Gift Boxes",
    price: "£85",
    image: eclipseImage,
  },
  {
    id: 3,
    name: "The Mum Box",
    category: "Gift Boxes",
    price: "£55",
    image: haloImage,
    isNew: true,
  },
  {
    id: 4,
    name: "The Just Because Box",
    category: "Gift Boxes",
    price: "£45",
    image: obliqueImage,
  },
  {
    id: 5,
    name: "The Luxury Box",
    category: "Gift Boxes",
    price: "£120",
    image: lintelImage,
  },
  {
    id: 6,
    name: "The Partner Box",
    category: "Gift Boxes",
    price: "£75",
    image: shadowlineImage,
  },
];

const ProductCarousel = ({ id }: ProductCarouselProps) => {
  return (
    <section id={id} className="w-full mb-16 px-6 scroll-mt-24">
      <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="">
            {products.map((product) => (
               <CarouselItem
                 key={product.id}
                 className="basis-1/2 md:basis-1/3 lg:basis-1/4 pr-2 md:pr-4"
               >
                 <ProductCard
                   product={product}
                   hoverImage={product.id % 2 === 0 ? organicEarring : linkBracelet}
                 />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
    </section>
  );
};

export default ProductCarousel;
