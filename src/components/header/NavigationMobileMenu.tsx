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
      className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-black/5 shadow-sm z-50 animate-in fade-in slide-in-from-top-2 duration-300"
      id={mobileMenuId}
      ref={mobileMenuPanelRef}
      role="dialog"
      tabIndex={-1}
    >
      <div className="px-6 py-6 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
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
