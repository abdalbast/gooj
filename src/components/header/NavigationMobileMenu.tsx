import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { getNavigationSubmenuHref, navItems } from "./navigationData";

interface NavigationMobileMenuProps {
  mobileMenuId: string;
  mobileMenuPanelRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export const NavigationMobileMenu = ({
  mobileMenuId,
  mobileMenuPanelRef,
  onClose,
}: NavigationMobileMenuProps) => {
  return (
    <div
      aria-label="Mobile menu"
      aria-modal="true"
      className="absolute left-0 right-0 top-full z-50 animate-in fade-in border-b border-black/5 bg-white/95 shadow-sm backdrop-blur-2xl slide-in-from-top-2 duration-300 lg:hidden"
      id={mobileMenuId}
      ref={mobileMenuPanelRef}
      role="dialog"
      tabIndex={-1}
    >
      <div className="custom-scrollbar max-h-[calc(100dvh-4rem-var(--safe-area-top)-var(--safe-area-bottom))] overflow-y-auto px-6 pb-[calc(1.5rem+var(--safe-area-bottom))] pt-6 touch-scroll">
        <div className="space-y-6">
          {navItems.map((item) => (
            <div key={item.name}>
              <Link
                className="flex min-h-11 items-center text-nav-foreground transition-colors duration-200 hover:text-nav-hover text-lg font-light py-2"
                onClick={onClose}
                to={item.href}
              >
                {item.name}
              </Link>
              <div className="mt-3 pl-4 space-y-2">
                {item.submenuItems.map((subItem) => (
                  <Link
                    className="flex min-h-11 items-center text-nav-foreground/70 hover:text-nav-hover text-sm font-light py-1"
                    key={subItem}
                    onClick={onClose}
                    to={getNavigationSubmenuHref(item, subItem)}
                  >
                    {subItem}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-black/5 pt-6">
            <Link
              className="flex min-h-11 items-center text-nav-foreground transition-colors duration-200 hover:text-nav-hover text-lg font-light py-2"
              onClick={onClose}
              to="/admin"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
