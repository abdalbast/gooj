import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const CheckoutHeader = () => {
  return (
    <header className="w-full border-b border-muted-foreground/20 bg-background pt-[var(--safe-area-top)]">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="relative flex items-center justify-between">
          {/* Left side - Continue Shopping */}
          <Link 
            to="/" 
            className="flex min-h-11 items-center gap-2 text-foreground transition-colors hover:text-foreground/80"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-light hidden sm:inline">Continue Shopping</span>
          </Link>

          {/* Center - Logo - Absolutely positioned to ensure perfect centering */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2">
            <span className="text-xl font-light tracking-wider">GOOJ</span>
          </Link>

          {/* Right side - Support */}
          <div className="text-sm font-light text-foreground">
            Support
          </div>
        </div>
      </div>
    </header>
  );
};

export default CheckoutHeader;
