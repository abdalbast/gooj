import { X, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CartItem {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  category: string;
}

interface ShoppingBagProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (id: number, newQuantity: number) => void;
  onViewFavorites?: () => void;
}

const ShoppingBag = ({ isOpen, onClose, cartItems, updateQuantity, onViewFavorites }: ShoppingBagProps) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('£', '').replace(',', ''));
    return sum + (price * item.quantity);
  }, 0);

  return (
    <>
      {/* Invisible backdrop to capture clicks outside the popover */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Apple-style popover */}
      <div className="absolute top-full right-6 w-[22rem] mt-2 bg-white/85 backdrop-blur-2xl border border-black/5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col overflow-hidden custom-scrollbar max-h-[calc(100vh-100px)]">
        
        {/* Content */}
        <div className="flex-1 flex flex-col p-5">
          {/* Mobile favorites toggle - only show on mobile */}
          {onViewFavorites && (
            <div className="md:hidden pb-4 mb-4 border-b border-black/5">
              <button
                onClick={onViewFavorites}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50/50 rounded-xl text-gray-800 hover:bg-gray-100/50 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                <span className="text-sm font-medium">View Favorites</span>
              </button>
            </div>
          )}
          
          {cartItems.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 text-sm mb-4">
                Your bag is empty.
              </p>
              <Button 
                variant="outline" 
                className="w-full rounded-full bg-white/50 border-gray-200 text-gray-800 hover:bg-gray-50" 
                onClick={onClose}
                asChild
              >
                <Link to="/category/shop">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Bag summary header */}
              <div className="mb-4">
                <h3 className="text-xl font-medium text-gray-900">Bag</h3>
              </div>

              {/* Cart items */}
              <div className="overflow-y-auto space-y-4 mb-5 max-h-[50vh] pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="truncate">
                          <h4 className="text-[15px] font-medium text-gray-900 truncate">{item.name}</h4>
                          <p className="text-[13px] text-gray-500">{item.category}</p>
                        </div>
                        <p className="text-[15px] font-medium text-gray-900 whitespace-nowrap">{item.price}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </button>
                          <span className="text-[15px] font-medium w-3 text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, 0)}
                          className="text-[13px] text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Subtotal and checkout */}
              <div className="border-t border-black/5 pt-4 space-y-4">
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-gray-900 font-medium">Subtotal</span>
                  <span className="text-gray-900 font-medium">£{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2 pt-1">
                  <Button 
                    asChild 
                    className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium border-0 py-6"
                    onClick={onClose}
                  >
                    <Link to="/checkout">
                      Check Out
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ShoppingBag;