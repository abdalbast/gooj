import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { startVersionSync } from "./lib/versionSync";
import { AuthProvider } from "./contexts/AuthContext";

startVersionSync();

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
);
