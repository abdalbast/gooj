import { Suspense, lazy, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  useBodyScrollLock,
  useEscapeKey,
  useFocusRestore,
  useInitialFocus,
} from "@/hooks/use-overlay-accessibility";
import { useCart } from "@/contexts/CartContext";
import { NavigationFavoritesPanel } from "./NavigationFavoritesPanel";
import { NavigationMegaMenu } from "./NavigationMegaMenu";
import { NavigationMobileMenu } from "./NavigationMobileMenu";
import { NavigationSearchPanel } from "./NavigationSearchPanel";
import { navItems } from "./navigationData";

const loadShoppingBag = () => import("./ShoppingBag");
const ShoppingBag = lazy(loadShoppingBag);

const Navigation = () => {
  const { itemCount: totalItems } = useCart();
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

  const preloadShoppingBag = () => {
    void loadShoppingBag();
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
    preloadShoppingBag();
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
      <div className="flex h-16 items-center justify-between pl-[max(1.5rem,var(--safe-area-left))] pr-[max(1.5rem,var(--safe-area-right))]">
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
            className="hidden min-h-11 items-center rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-nav-foreground transition-colors duration-200 hover:border-black/20 hover:text-nav-hover lg:inline-flex"
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
            onFocus={() => {
              preloadShoppingBag();
            }}
            onMouseEnter={() => {
              preloadShoppingBag();
            }}
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
          className="fixed inset-x-0 bottom-0 top-[calc(4rem+var(--safe-area-top))] z-40 animate-in fade-in bg-neutral-900/20 backdrop-blur-sm duration-300"
          onClick={closeDropdown}
        />
      )}

      {activeNavItem ? (
        <NavigationMegaMenu
          activeItem={activeNavItem}
          megaMenuId={megaMenuId}
          onClose={closeDropdown}
          onOpen={openDropdown}
        />
      ) : null}

      {/* Search backdrop */}
      {isSearchOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-[calc(4rem+var(--safe-area-top))] z-40 animate-in fade-in bg-neutral-900/20 backdrop-blur-sm duration-300"
          onClick={closeSearch}
        />
      )}

      {isSearchOpen && (
        <NavigationSearchPanel
          searchDialogId={searchDialogId}
          searchInputRef={searchInputRef}
          searchTitleId={searchTitleId}
        />
      )}

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-[calc(4rem+var(--safe-area-top))] z-40 animate-in fade-in bg-neutral-900/20 backdrop-blur-sm duration-300 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {isMobileMenuOpen && (
        <NavigationMobileMenu
          mobileMenuId={mobileMenuId}
          mobileMenuPanelRef={mobileMenuPanelRef}
          onClose={closeMobileMenu}
        />
      )}
      
      <Suspense fallback={null}>
        {isShoppingBagOpen ? (
          <ShoppingBag
            isOpen={isShoppingBagOpen}
            onClose={closeShoppingBag}
            panelId={shoppingBagId}
            titleId={shoppingBagTitleId}
            initialFocusRef={shoppingBagCloseButtonRef}
            onViewFavorites={() => {
              openFavorites(shoppingBagButtonRef.current);
            }}
          />
        ) : null}
      </Suspense>

      {favoritesOpen ? (
        <NavigationFavoritesPanel
          favoritesCloseButtonRef={favoritesCloseButtonRef}
          favoritesPanelId={favoritesPanelId}
          favoritesTitleId={favoritesTitleId}
          onClose={closeFavorites}
        />
      ) : null}
    </nav>
  );
};

export default Navigation;
