import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startWebVitalsMonitoring } from "./lib/performance";
import { startVersionSync } from "./lib/versionSync";
import { CartProvider } from "./contexts/CartContext";

startVersionSync();
startWebVitalsMonitoring();

createRoot(document.getElementById("root")!).render(
  <CartProvider>
    <App />
  </CartProvider>,
);
