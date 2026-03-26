import Pagination from "./Pagination";
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";
import obliqueImage from "@/assets/oblique.jpg";
import lintelImage from "@/assets/lintel.jpg";
import shadowlineImage from "@/assets/shadowline.jpg";
import organicEarring from "@/assets/organic-earring.png";
import linkBracelet from "@/assets/link-bracelet.png";
import ProductCard, { type ProductCardProduct } from "@/components/product/ProductCard";

const products: ProductCardProduct[] = [
  { id: 1, name: "The Birthday Box", category: "Gift Boxes", price: "£65", image: pantheonImage, isNew: true },
  { id: 2, name: "The Anniversary Box", category: "Gift Boxes", price: "£85", image: eclipseImage },
  { id: 3, name: "The Mum Box", category: "Gift Boxes", price: "£55", image: haloImage, isNew: true },
  { id: 4, name: "The Just Because Box", category: "Gift Boxes", price: "£45", image: obliqueImage },
  { id: 5, name: "The Luxury Box", category: "Luxury Boxes", price: "£120", image: lintelImage },
  { id: 6, name: "The Partner Box", category: "Gift Boxes", price: "£75", image: shadowlineImage },
  { id: 7, name: "The Pamper Box", category: "Gift Boxes", price: "£58", image: pantheonImage },
  { id: 8, name: "The Date Night Box", category: "Luxury Boxes", price: "£95", image: eclipseImage },
  { id: 9, name: "The Thank You Box", category: "Gift Boxes", price: "£42", image: haloImage },
  { id: 10, name: "The New Mum Box", category: "Gift Boxes", price: "£68", image: obliqueImage },
  { id: 11, name: "The Wellness Box", category: "Gift Boxes", price: "£52", image: lintelImage },
  { id: 12, name: "The Christmas Box", category: "Luxury Boxes", price: "£110", image: shadowlineImage },
  { id: 13, name: "The Valentine's Box", category: "Gift Boxes", price: "£72", image: pantheonImage },
  { id: 14, name: "The Engagement Box", category: "Luxury Boxes", price: "£98", image: eclipseImage },
  { id: 15, name: "The Self-Care Box", category: "Gift Boxes", price: "£48", image: haloImage },
  { id: 16, name: "The Bridesmaid Box", category: "Gift Boxes", price: "£55", image: obliqueImage },
  { id: 17, name: "The Graduation Box", category: "Gift Boxes", price: "£62", image: lintelImage },
  { id: 18, name: "The Corporate Box", category: "Luxury Boxes", price: "£105", image: shadowlineImage },
  { id: 19, name: "The Get Well Box", category: "Gift Boxes", price: "£50", image: pantheonImage },
  { id: 20, name: "The New Home Box", category: "Gift Boxes", price: "£78", image: eclipseImage },
  { id: 21, name: "The Sister Box", category: "Gift Boxes", price: "£52", image: haloImage },
  { id: 22, name: "The Best Friend Box", category: "Gift Boxes", price: "£58", image: obliqueImage },
  { id: 23, name: "The Seasonal Box", category: "Gift Boxes", price: "£65", image: lintelImage },
  { id: 24, name: "The Ultimate Box", category: "Luxury Boxes", price: "£150", image: shadowlineImage },
];

const ProductGrid = () => {
  return (
    <section className="w-full px-6 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              hoverImage={product.id % 2 === 0 ? organicEarring : linkBracelet}
              eager={product.id <= 4}
            />
          ))}
        </div>
      
      <Pagination />
    </section>
  );
};

export default ProductGrid;
