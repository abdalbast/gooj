import { ArrowRight, X, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ShoppingBag from "./ShoppingBag";
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";

interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  category: string;
}

const popularSearches = [
  "Birthday Gift",
  "Anniversary Box",
  "Gift for Mum",
  "Personalised Box",
  "Luxury Gift Set",
  "Last Minute Gift",
];

const navItems = [
  {
    name: "Shop",
    href: "/category/shop",
    submenuItems: [
      "For Her Birthday",
      "For Mum",
      "For Partner",
      "Anniversary",
      "Just Because",
    ],
    images: [
      { src: "/rings-collection.png", alt: "Birthday Gift Box", label: "Birthday Boxes" },
      { src: "/earrings-collection.png", alt: "Anniversary Gift Box", label: "Anniversary Boxes" },
    ],
  },
  {
    name: "New in",
    href: "/category/new-in",
    submenuItems: [
      "This Week's Boxes",
      "Seasonal Collection",
      "Limited Edition",
      "Personalised",
      "Best Sellers",
    ],
    images: [
      { src: "/arcus-bracelet.png", alt: "New Gift Box", label: "Spring Collection" },
      { src: "/span-bracelet.png", alt: "Limited Edition Box", label: "Limited Edition" },
    ],
  },
  {
    name: "About",
    href: "/about/our-story",
    submenuItems: [
      "Our Story",
      "Sustainability",
      "Gift Guide",
      "Customer Care",
      "Store Locator",
    ],
    images: [{ src: "/founders.png", alt: "The GOOJ Story", label: "Read our story" }],
  },
] as const;

const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [offCanvasType, setOffCanvasType] = useState<'favorites' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShoppingBagOpen, setIsShoppingBagOpen] = useState(false);
  
  // Lock body scroll when any overlay is open
  const isAnyOverlayOpen = activeDropdown !== null || isSearchOpen || isMobileMenuOpen || isShoppingBagOpen || offCanvasType !== null;
  
  useEffect(() => {
    if (isAnyOverlayOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyOverlayOpen]);

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "The Birthday Box",
      price: "£65",
      image: pantheonImage,
      quantity: 1,
      category: "Gift Boxes"
    },
    {
      id: 2,
      name: "The Anniversary Box",
      price: "£85", 
      image: eclipseImage,
      quantity: 1,
      category: "Gift Boxes"
    },
    {
      id: 3,
      name: "The Just Because Box",
      price: "£45",
      image: haloImage, 
      quantity: 1,
      category: "Gift Boxes"
    }
  ]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(items => items.filter(item => item.id !== id));
    } else {
      setCartItems(items => 
        items.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };
  
  useEffect(() => {
    if (!activeDropdown) {
      return;
    }

    const activeItem = navItems.find((item) => item.name === activeDropdown);

    if (!activeItem) {
      return;
    }

    activeItem.images.forEach((image) => {
      const img = new Image();
      img.src = image.src;
    });
  }, [activeDropdown]);

  return (
    <nav 
      className="relative" 
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        <button
          className="lg:hidden p-2 mt-0.5 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-5 relative">
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 top-2.5' : 'top-1.5'
            }`}></span>
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 top-2.5 ${
              isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}></span>
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 top-2.5' : 'top-3.5'
            }`}></span>
          </div>
        </button>

        <div className="hidden lg:flex space-x-8">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                to={item.href}
                className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light py-6 block"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="block">
            <span className="text-xl font-light tracking-wider">GOOJ</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin"
            className="hidden lg:inline-flex items-center rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-nav-foreground transition-colors duration-200 hover:border-black/20 hover:text-nav-hover"
          >
            Admin
          </Link>
          <button 
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Search"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
          <button 
            className="hidden lg:block p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Favorites"
            onClick={() => setOffCanvasType('favorites')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>
          <button 
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative"
            aria-label="Shopping bag"
            onClick={() => setIsShoppingBagOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[30%] text-[0.5rem] font-semibold text-black pointer-events-none">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Dropdown backdrop */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 top-16 bg-neutral-900/20 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {activeDropdown && (
        <div 
          className="absolute top-full left-0 right-0 bg-white/90 backdrop-blur-2xl border-b border-black/5 shadow-sm z-50 animate-in fade-in slide-in-from-top-2 duration-300"
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="px-6 py-8 max-w-7xl mx-auto">
            <div className="flex justify-between w-full">
              <div className="flex-1">
                <ul className="space-y-2">
                   {navItems
                     .find(item => item.name === activeDropdown)
                     ?.submenuItems.map((subItem, index) => (
                      <li
                        key={index}
                        style={{ transitionDelay: "50ms" }}
                        className="transform transition-all duration-300 translate-y-0 opacity-100 starting:-translate-y-2 starting:opacity-0"
                      >
                        <Link 
                          to={activeDropdown === "About" ? `/about/${subItem.toLowerCase().replace(/\s+/g, '-')}` : `/category/${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-gray-600 hover:text-black transition-colors duration-200 text-[15px] font-medium block py-2"
                        >
                          {subItem}
                        </Link>
                      </li>
                   ))}
                </ul>
              </div>

              <div className="flex space-x-6">
                {navItems
                  .find(item => item.name === activeDropdown)
                  ?.images.map((image, index) => {
                    let linkTo = "/";
                    if (activeDropdown === "Shop") {
                      linkTo = "/category/shop";
                    } else if (activeDropdown === "New in") {
                      linkTo = "/category/new-in";
                    } else if (activeDropdown === "About") {
                      linkTo = "/about/our-story";
                    }
                    
                    return (
                      <Link key={index} to={linkTo} className="w-[400px] h-[280px] cursor-pointer group relative overflow-hidden block rounded-2xl transform transition-all duration-500 delay-100 translate-y-0 opacity-100 starting:translate-y-4 starting:opacity-0 bg-gray-100">
                        <img 
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                        />
                        {(activeDropdown === "Shop" || activeDropdown === "New in" || activeDropdown === "About") && (
                          <div className="absolute bottom-2 left-2 text-white text-xs font-light flex items-center gap-1">
                            <span>{image.label}</span>
                            <ArrowRight size={12} />
                          </div>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search backdrop */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 top-16 bg-neutral-900/20 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={() => setIsSearchOpen(false)}
        />
      )}

      {isSearchOpen && (
        <div 
          className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-black/5 shadow-sm z-50 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="px-6 py-10">
            <div className="max-w-2xl mx-auto">
              <div className="relative mb-10 transform transition-all duration-300 delay-75 translate-y-0 opacity-100 starting:-translate-y-4 starting:opacity-0">
                <div className="flex items-center border-b border-gray-200 pb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-400 mr-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                    <input
                      type="text"
                      placeholder="Search for gift boxes..."
                      className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none text-2xl font-light"
                      autoFocus
                    />
                </div>
              </div>

              <div className="transform transition-all duration-300 delay-150 translate-y-0 opacity-100 starting:translate-y-4 starting:opacity-0">
                <h3 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      className="text-gray-800 bg-gray-100 hover:bg-gray-200 text-[15px] font-medium py-2.5 px-5 rounded-full transition-colors duration-200"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 top-16 bg-neutral-900/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-black/5 shadow-sm z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="px-6 py-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-lg font-light block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                   <div className="mt-3 pl-4 space-y-2">
                     {item.submenuItems.map((subItem, subIndex) => (
                       <Link
                         key={subIndex}
                         to={item.name === "About" ? `/about/${subItem.toLowerCase().replace(/\s+/g, '-')}` : `/category/${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                         className="text-nav-foreground/70 hover:text-nav-hover text-sm font-light block py-1"
                         onClick={() => setIsMobileMenuOpen(false)}
                       >
                         {subItem}
                       </Link>
                     ))}
                  </div>
                </div>
              ))}

              <div className="border-t border-black/5 pt-6">
                <Link
                  to="/admin"
                  className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-lg font-light block py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ShoppingBag 
        isOpen={isShoppingBagOpen}
        onClose={() => setIsShoppingBagOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        onViewFavorites={() => {
          setIsShoppingBagOpen(false);
          setOffCanvasType('favorites');
        }}
      />
      
      {offCanvasType === 'favorites' && (
        <div className="fixed inset-0 z-50 h-screen">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm h-screen transition-opacity duration-300"
            onClick={() => setOffCanvasType(null)}
          />
          
          <div className="absolute right-0 top-0 h-screen w-96 bg-background border-l border-border animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-light text-foreground">Your Favorites</h2>
              <button
                onClick={() => setOffCanvasType(null)}
                className="p-2 text-foreground hover:text-muted-foreground transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-muted-foreground text-sm mb-6">
                You haven't added any favorites yet. Browse our gift boxes and click the heart icon to save ones you love.
              </p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
