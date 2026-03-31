import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ResponsivePicture from "@/components/ui/ResponsivePicture";
import {
  getNavigationFeatureHref,
  getNavigationSubmenuHref,
  type NavigationItem,
} from "./navigationData";

interface NavigationMegaMenuProps {
  activeItem: NavigationItem;
  megaMenuId: string;
  onClose: () => void;
  onOpen: (itemName: string) => void;
}

export const NavigationMegaMenu = ({
  activeItem,
  megaMenuId,
  onClose,
  onOpen,
}: NavigationMegaMenuProps) => {
  return (
    <div
      aria-label={`${activeItem.name} menu`}
      className="absolute top-full left-0 right-0 bg-white/90 backdrop-blur-2xl border-b border-black/5 shadow-sm z-50 animate-in fade-in slide-in-from-top-2 duration-300"
      id={megaMenuId}
      onMouseEnter={() => onOpen(activeItem.name)}
      onMouseLeave={onClose}
      role="menu"
    >
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex justify-between w-full">
          <div className="flex-1">
            <ul className="space-y-2">
              {activeItem.submenuItems.map((subItem) => (
                <li
                  className="transform transition-all duration-300 translate-y-0 opacity-100 starting:-translate-y-2 starting:opacity-0"
                  key={subItem}
                  style={{ transitionDelay: "50ms" }}
                >
                  <Link
                    className="text-gray-600 hover:text-black transition-colors duration-200 text-[15px] font-medium block py-2"
                    onClick={onClose}
                    role="menuitem"
                    to={getNavigationSubmenuHref(activeItem, subItem)}
                  >
                    {subItem}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex space-x-6">
            {activeItem.images.map((image, index) => (
              <Link
                className="w-[400px] h-[280px] cursor-pointer group relative overflow-hidden block rounded-2xl transform transition-all duration-500 delay-100 translate-y-0 opacity-100 starting:translate-y-4 starting:opacity-0 bg-gray-100"
                key={`${image.label}-${index}`}
                to={getNavigationFeatureHref(activeItem)}
              >
                <ResponsivePicture
                  alt={image.alt}
                  avifSrc={image.avifSrc}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                  decoding="async"
                  loading="eager"
                  pictureClassName="block h-full w-full"
                  sizes="400px"
                  src={image.src}
                />
                <div className="absolute bottom-2 left-2 text-white text-xs font-light flex items-center gap-1">
                  <span>{image.label}</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
