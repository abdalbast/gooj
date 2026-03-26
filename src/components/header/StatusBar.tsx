import { useEffect, useState } from "react";
import { SHOPPER_USPS } from "@/lib/commerce";

const StatusBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % SHOPPER_USPS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-status-bar text-status-bar-foreground py-2">
      <div className="container mx-auto px-4 text-center">
        <p 
          key={currentIndex}
          className="text-sm font-light transition-all duration-700 ease-in-out opacity-100 animate-fade-in"
        >
          {SHOPPER_USPS[currentIndex]}
        </p>
      </div>
    </div>
  );
};

export default StatusBar;
