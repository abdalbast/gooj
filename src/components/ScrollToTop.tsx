import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    let isCancelled = false;
    let attempts = 0;

    const scrollToHashTarget = () => {
      if (isCancelled) {
        return;
      }

      const target = document.getElementById(hash.replace("#", ""));

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      if (attempts < 8) {
        attempts += 1;
        window.setTimeout(scrollToHashTarget, 100);
      }
    };

    scrollToHashTarget();

    return () => {
      isCancelled = true;
    };
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
