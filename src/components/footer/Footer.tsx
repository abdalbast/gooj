import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-white text-black pt-8 pb-2 px-6 border-t border-[#e5e5e5] mt-48">
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          <div>
            <h3 className="text-xl font-light mb-4">GOOJ</h3>
            <p className="text-sm font-light text-black/70 leading-relaxed max-w-md mb-6">
              Thoughtful made easy. Curated gift boxes that take the stress out of gifting.
            </p>
            
            <div className="space-y-2 text-sm font-light text-black/70">
              <div>
                <p className="font-normal text-black mb-1">Visit Us</p>
                <p>42 Clerkenwell Road</p>
                <p>London, EC1M 5PS</p>
              </div>
              <div>
                <p className="font-normal text-black mb-1 mt-3">Contact</p>
                <p>+44 20 7946 0958</p>
                <p>hello@gooj.co.uk</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-normal mb-4">Shop</h4>
              <ul className="space-y-2">
                <li><Link to="/category/new-in" className="text-sm font-light text-black/70 hover:text-black transition-colors">New In</Link></li>
                <li><Link to="/category/for-her-birthday" className="text-sm font-light text-black/70 hover:text-black transition-colors">For Her Birthday</Link></li>
                <li><Link to="/category/for-mum" className="text-sm font-light text-black/70 hover:text-black transition-colors">For Mum</Link></li>
                <li><Link to="/category/anniversary" className="text-sm font-light text-black/70 hover:text-black transition-colors">Anniversary</Link></li>
                <li><Link to="/category/just-because" className="text-sm font-light text-black/70 hover:text-black transition-colors">Just Because</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-normal mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/about/gift-guide" className="text-sm font-light text-black/70 hover:text-black transition-colors">Gift Guide</Link></li>
                <li><Link to="/about/customer-care" className="text-sm font-light text-black/70 hover:text-black transition-colors">Customer Care</Link></li>
                <li><Link to="/reminders" className="text-sm font-light text-black/70 hover:text-black transition-colors">Date Reminders</Link></li>
                <li><Link to="/about/customer-care" className="text-sm font-light text-black/70 hover:text-black transition-colors">Delivery Info</Link></li>
                <li><Link to="/about/customer-care" className="text-sm font-light text-black/70 hover:text-black transition-colors">Returns</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-normal mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Instagram</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">TikTok</a></li>
                <li><a href="#" className="text-sm font-light text-black/70 hover:text-black transition-colors">Newsletter</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#e5e5e5] -mx-6 px-6 pt-2">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm font-light text-black mb-1 md:mb-0">
            © 2025 GOOJ. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-sm font-light text-black hover:text-black/70 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-sm font-light text-black hover:text-black/70 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
