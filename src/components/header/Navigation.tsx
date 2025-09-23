import { Search, User, ShoppingBag } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const navItems = [
    { 
      name: "Shop", 
      href: "/shop",
      submenuItems: [
        "Women's Collection",
        "Men's Collection", 
        "Accessories",
        "Sale Items",
        "New Arrivals"
      ],
      images: [
        { src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop", alt: "Shop Collection 1" },
        { src: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&h=200&fit=crop", alt: "Shop Collection 2" }
      ]
    },
    { 
      name: "New in", 
      href: "/new-in",
      submenuItems: [
        "This Week's Arrivals",
        "Spring Collection",
        "Featured Designers",
        "Limited Edition",
        "Pre-Orders"
      ],
      images: [
        { src: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&h=200&fit=crop", alt: "New Arrivals 1" },
        { src: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=300&h=200&fit=crop", alt: "New Arrivals 2" }
      ]
    },
    { 
      name: "About", 
      href: "/about",
      submenuItems: [
        "Our Story",
        "Sustainability",
        "Size Guide",
        "Customer Care",
        "Store Locator"
      ],
      images: [
        { src: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop", alt: "About Us 1" },
        { src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=200&fit=crop", alt: "About Us 2" }
      ]
    }
  ];

  return (
    <nav className="bg-nav border-b border-border relative">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left navigation */}
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <div
              key={item.name}
              className="relative"
              onMouseEnter={() => setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <a
                href={item.href}
                className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light py-6 block"
              >
                {item.name}
              </a>
            </div>
          ))}
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <a href="/" className="text-2xl font-light tracking-wider text-foreground">
            LINEA
          </a>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-4">
          <button 
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button 
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200"
            aria-label="Account"
          >
            <User size={20} />
          </button>
          <button 
            className="p-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative"
            aria-label="Shopping bag"
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>

      {/* Full width dropdown */}
      {activeDropdown && (
        <div 
          className="absolute top-full left-0 right-0 bg-nav border-b border-border shadow-lg z-50"
          onMouseEnter={() => setActiveDropdown(activeDropdown)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="px-6 py-8">
            <div className="flex justify-between max-w-6xl mx-auto">
              {/* Left side - Menu items */}
              <div className="flex-1">
                <ul className="space-y-3">
                  {navItems
                    .find(item => item.name === activeDropdown)
                    ?.submenuItems.map((subItem, index) => (
                    <li key={index}>
                      <a 
                        href="#"
                        className="text-nav-foreground hover:text-nav-hover transition-colors duration-200 text-sm font-light block py-1"
                      >
                        {subItem}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right side - Images */}
              <div className="flex space-x-4 ml-12">
                {navItems
                  .find(item => item.name === activeDropdown)
                  ?.images.map((image, index) => (
                  <div key={index} className="w-48 h-32 cursor-pointer group">
                    <img 
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;