import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";

createRoot(document.getElementById("root")!).render(
    <SiteSettingsProvider>
        <App />
    </SiteSettingsProvider>
);