import earringsCollection from "@/assets/earrings-collection.png";
import linkBracelet from "@/assets/link-bracelet.png";
import { Link } from "react-router-dom";

const FiftyFiftySection = () => {
  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Link to="/category/for-her-birthday" className="block">
            <div className="w-full aspect-square mb-3 overflow-hidden">
              <img 
                src={earringsCollection} 
                alt="Curated birthday gift box" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          <div className="">
            <h3 className="text-sm font-normal text-foreground mb-1">
              Curated with Care
            </h3>
            <p className="text-sm font-light text-foreground">
              Every box is hand-picked with keepsakes, treats and personal touches
            </p>
          </div>
        </div>

        <div>
          <Link to="/category/anniversary" className="block">
            <div className="w-full aspect-square mb-3 overflow-hidden">
              <img 
                src={linkBracelet} 
                alt="Luxury unboxing experience" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          <div className="">
            <h3 className="text-sm font-normal text-foreground mb-1">
              The Unboxing Experience
            </h3>
            <p className="text-sm font-light text-foreground">
              Premium packaging that makes the moment as special as the gift inside
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FiftyFiftySection;
