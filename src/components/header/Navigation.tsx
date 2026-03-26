import { ArrowRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  useBodyScrollLock,
  useEscapeKey,
  useFocusRestore,
  useInitialFocus,
} from "@/hooks/use-overlay-accessibility";
import { buildVersionedUrl } from "@/lib/versionSync";
import ShoppingBag from "./ShoppingBag";
import pantheonImage from "@/assets/pantheon.webp";
import eclipseImage from "@/assets/eclipse.webp";
import haloImage from "@/assets/halo.webp";

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
      {
        src: buildVersionedUrl("/rings-collection.webp"),
        alt: "Birthday Gift Box",
        label: "Birthday Boxes",
      },
      {
        src: buildVersionedUrl("/earrings-collection.webp"),
        alt: "Anniversary Gift Box",
        label: "Anniversary Boxes",
      },
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
      {
        src: buildVersionedUrl("/arcus-bracelet.webp"),
        alt: "New Gift Box",
        label: "Spring Collection",
      },
      {
        src: buildVersionedUrl("/span-bracelet.webp"),
        alt: "Limited Edition Box",
        label: "Limited Edition",
      },
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
    images: [
      {
        src: buildVersionedUrl("/founders.webp"),
        alt: "The GOOJ Story",
        label: "Read our story",
      },
    ],
  },
] as const;

const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [offCanvasType, setOffCanvasType] = useState<"favorites" | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isShoppingBagOpen, setIsShoppingBagOpen] = useState(false);
  const navigationRef = useRef<HTMLElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const favoritesButtonRef = useRef<HTMLButtonElement | null>(null);
  const favoritesRestoreTargetRef = useRef<HTMLElement | null>(null);
  const favoritesCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuPanelRef = useRef<HTMLDivElement | null>(null);
  const shoppingBagButtonRef = useRef<HTMLButtonElement | null>(null);
  const shoppingBagCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const megaMenuId = useId();
  const mobileMenuId = useId();
  const searchDialogId = useId();
  const searchTitleId = useId();
  const shoppingBagId = useId();
  const shoppingBagTitleId = useId();
  const favoritesPanelId = useId();
  const favoritesTitleId = useId();
  const favoritesOpen = offCanvasType === "favorites";

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "The Birthday Box",
      price: "£65",
      image: pantheonImage,
      quantity: 1,
      category: "Gift Boxes",
    },
    {
      id: 2,
      name: "The Anniversary Box",
      price: "£85",
      image: eclipseImage,
      quantity: 1,
      category: "Gift Boxes",
    },
    {
      id: 3,
      name: "The Just Because Box",
      price: "£45",
      image: haloImage,
      quantity: 1,
      category: "Gift Boxes",
    },
  ]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const activeNavItem = navItems.find((item) => item.name === activeDropdown) ?? null;
  const isAnyOverlayOpen =
    activeDropdown !== null ||
    isSearchOpen ||
    isMobileMenuOpen ||
    isShoppingBagOpen ||
    favoritesOpen;

  useBodyScrollLock(isAnyOverlayOpen);
  useFocusRestore(isSearchOpen, searchButtonRef);
  useFocusRestore(isMobileMenuOpen, mobileMenuButtonRef);
  useFocusRestore(isShoppingBagOpen, shoppingBagButtonRef);
  useFocusRestore(favoritesOpen, favoritesRestoreTargetRef);
  useInitialFocus(isSearchOpen, searchInputRef);
  useInitialFocus(isMobileMenuOpen, mobileMenuPanelRef);
  useInitialFocus(isShoppingBagOpen, shoppingBagCloseButtonRef);
  useInitialFocus(favoritesOpen, favoritesCloseButtonRef);

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const closeShoppingBag = () => {
    setIsShoppingBagOpen(false);
  };

  const closeFavorites = () => {
    setOffCanvasType(null);
  };

  const openDropdown = (itemName: string) => {
    closeSearch();
    closeMobileMenu();
    closeShoppingBag();
    closeFavorites();
    setActiveDropdown(itemName);
  };

  const toggleSearch = () => {
    closeDropdown();
    closeMobileMenu();
    closeShoppingBag();
    closeFavorites();
    setIsSearchOpen((currentValue) => !currentValue);
  };

  const toggleMobileMenu = () => {
    closeDropdown();
    closeSearch();
    closeShoppingBag();
    closeFavorites();
    setIsMobileMenuOpen((currentValue) => !currentValue);
  };

  const openShoppingBag = () => {
    closeDropdown();
    closeSearch();
    closeMobileMenu();
    closeFavorites();
    setIsShoppingBagOpen(true);
  };

  const openFavorites = (restoreTarget: HTMLElement | null) => {
    favoritesRestoreTargetRef.current = restoreTarget;
    closeDropdown();
    closeSearch();
    closeMobileMenu();
    closeShoppingBag();
    setOffCanvasType("favorites");
  };

  useEscapeKey(isAnyOverlayOpen, () => {
    if (favoritesOpen) {
      closeFavorites();
      return;
    }

    if (isShoppingBagOpen) {
      closeShoppingBag();
      return;
    }

    if (isSearchOpen) {
      closeSearch();
      return;
    }

    if (isMobileMenuOpen) {
      closeMobileMenu();
      return;
    }

    if (activeDropdown) {
      closeDropdown();
    }
  });

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((items) => items.filter((item) => item.id !== id));
    } else {
      setCartItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item,
        ),
      );
    }
  };

  useEffect(() => {
    if (!activeNavItem) {
      return;
    }

    activeNavItem.images.forEach((image) => {
      const img = new Image();
      img.src = image.src;
    });
  }, [activeNavItem]);

  useEffect(() => {
    if (!activeDropdown) {
      return;
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (!navigationRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener("focusin", handleFocusIn);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [activeDropdown]);

  return (
    <nav
      ref={navigationRef}
      className="relative"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        <button
          ref={mobileMenuButtonRef}
          type="button"
          className="mt-0.5 flex h-11 w-11 items-center justify-center text-nav-foreground transition-colors duration-200 hover:text-nav-hover lg:hidden"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls={mobileMenuId}
        >
          <div className="w-5 h-5 relative">
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 top-2.5" : "top-1.5"
            }`} />
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 top-2.5 ${
              isMobileMenuOpen ? "opacity-0" : "opacity-100"
            }`} />
            <span className={`absolute block w-5 h-px bg-current transform transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 top-2.5" : "top-3.5"
            }`} />
          </div>
        </button>

        <div className="hidden lg:flex space-x-8">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => openDropdown(item.name)}
              onMouseLeave={closeDropdown}
            >
              <Link
                to={item.href}
                onFocus={() => openDropdown(item.name)}
                className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light py-6 block"
                aria-expanded={activeDropdown === item.name}
                aria-controls={megaMenuId}
                aria-haspopup="menu"
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
            ref={searchButtonRef}
            type="button"
            className="flex h-11 w-11 items-center justify-center text-nav-foreground transition-colors duration-200 hover:text-nav-hover"
            aria-label="Search"
            aria-expanded={isSearchOpen}
            aria-controls={searchDialogId}
            onClick={toggleSearch}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
          <button
            ref={favoritesButtonRef}
            type="button"
            className="hidden h-11 w-11 items-center justify-center text-nav-foreground transition-colors duration-200 hover:text-nav-hover lg:flex"
            aria-label="Favorites"
            aria-expanded={favoritesOpen}
            aria-controls={favoritesPanelId}
            onClick={() => openFavorites(favoritesButtonRef.current)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>
          <button
            ref={shoppingBagButtonRef}
            type="button"
            className="relative flex h-11 w-11 items-center justify-center text-nav-foreground transition-colors duration-200 hover:text-nav-hover"
            aria-label="Shopping bag"
            aria-expanded={isShoppingBagOpen}
            aria-controls={shoppingBagId}
            onClick={openShoppingBag}
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
          onClick={closeDropdown}
        />
      )}

      {activeNavItem ? (
        <div
          id={megaMenuId}
          role="menu"
          aria-label={`${activeNavItem.name} menu`}
          className="absolute top-full left-0 right-0 bg-white/90 backdrop-blur-2xl border-b border-black/5 shadow-sm z-50 animate-in fade-in slide-in-from-top-2 duration-300"
          onMouseEnter={() => openDropdown(activeNavItem.name)}
          onMouseLeave={closeDropdown}
        >
          <div className="px-6 py-8 max-w-7xl mx-auto">
            <div className="flex justify-between w-full">
              <div className="flex-1">
                <ul className="space-y-2">
                  {activeNavItem.submenuItems.map((subItem, index) => (
                      <li
                        key={index}
                        style={{ transitionDelay: "50ms" }}
                        className="transform transition-all duration-300 translate-y-0 opacity-100 starting:-translate-y-2 starting:opacity-0"
                      >
                        <Link
                          to={activeNavItem.name === "About" ? `/about/${subItem.toLowerCase().replace(/\s+/g, "-")}` : `/category/${subItem.toLowerCase().replace(/\s+/g, "-")}`}
                          className="text-gray-600 hover:text-black transition-colors duration-200 text-[15px] font-medium block py-2"
                          role="menuitem"
                          onClick={closeDropdown}
                        >
                          {subItem}
                        </Link>
                      </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-6">
                {activeNavItem.images.map((image, index) => {
                    let linkTo = "/";
                    if (activeNavItem.name === "Shop") {
                      linkTo = "/category/shop";
                    } else if (activeNavItem.name === "New in") {
                      linkTo = "/category/new-in";
                    } else if (activeNavItem.name === "About") {
                      linkTo = "/about/our-story";
                    }

                    return (
                      <Link key={index} to={linkTo} className="w-[400px] h-[280px] cursor-pointer group relative overflow-hidden block rounded-2xl transform transition-all duration-500 delay-100 translate-y-0 opacity-100 starting:translate-y-4 starting:opacity-0 bg-gray-100">
                        <img
                          src={image.src}
                          alt={image.alt}
                          loading="eager"
                          decoding="async"
                          sizes="400px"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"
                        />
                        {(activeNavItem.name === "Shop" || activeNavItem.name === "New in" || activeNavItem.name === "About") && (
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
      ) : null}

      {/* Search backdrop */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 top-16 bg-neutral-900/20 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={closeSearch}
        />
      )}

      {isSearchOpen && (
        <div
          id={searchDialogId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={searchTitleId}
          className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-black/5 shadow-sm z-50 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="px-6 py-10">
            <div className="max-w-2xl mx-auto">
              <h2 id={searchTitleId} className="sr-only">
                Search gift boxes
              </h2>
              <div className="relative mb-10 transform transition-all duration-300 delay-75 translate-y-0 opacity-100 starting:-translate-y-4 starting:opacity-0">
                <div className="flex items-center border-b border-gray-200 pb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-400 mr-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for gift boxes..."
                    className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 outline-none text-2xl font-light"
                  />
                </div>
              </div>

              <div className="transform transition-all duration-300 delay-150 translate-y-0 opacity-100 starting:translate-y-4 starting:opacity-0">
                <h3 className="text-gray-500 text-sm font-medium mb-4 uppercase tracking-wider">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      type="button"
                      className="min-h-11 text-gray-800 bg-gray-100 hover:bg-gray-200 text-[15px] font-medium py-2.5 px-5 rounded-full transition-colors duration-200"
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
          onClick={closeMobileMenu}
        />
      )}

      {isMobileMenuOpen && (
        <div
          id={mobileMenuId}
          ref={mobileMenuPanelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
          tabIndex={-1}
          className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-black/5 shadow-sm z-50 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="px-6 py-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className="flex min-h-11 items-center text-nav-foreground transition-colors duration-200 hover:text-nav-hover text-lg font-light py-2"
                    onClick={closeMobileMenu}
                  >
                    {item.name}
                  </Link>
                  <div className="mt-3 pl-4 space-y-2">
                    {item.submenuItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={item.name === "About" ? `/about/${subItem.toLowerCase().replace(/\s+/g, "-")}` : `/category/${subItem.toLowerCase().replace(/\s+/g, "-")}`}
                        className="flex min-h-11 items-center text-nav-foreground/70 hover:text-nav-hover text-sm font-light py-1"
                        onClick={closeMobileMenu}
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
                  className="flex min-h-11 items-center text-nav-foreground transition-colors duration-200 hover:text-nav-hover text-lg font-light py-2"
                  onClick={closeMobileMenu}
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
        onClose={closeShoppingBag}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        panelId={shoppingBagId}
        titleId={shoppingBagTitleId}
        initialFocusRef={shoppingBagCloseButtonRef}
        onViewFavorites={() => {
          openFavorites(shoppingBagButtonRef.current);
        }}
      />

      {favoritesOpen && (
        <div className="fixed inset-0 z-50 h-screen">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm h-screen transition-opacity duration-300"
            onClick={closeFavorites}
          />

          <div
            id={favoritesPanelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={favoritesTitleId}
            className="absolute right-0 top-0 h-screen w-full max-w-96 bg-background border-l border-border animate-slide-in-right flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 id={favoritesTitleId} className="text-lg font-light text-foreground">
                Your Favorites
              </h2>
              <button
                ref={favoritesCloseButtonRef}
                type="button"
                onClick={closeFavorites}
                className="flex h-11 w-11 items-center justify-center text-foreground hover:text-muted-foreground transition-colors"
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
