import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*
     * HelmetProvider is required by react-helmet-async.
     * It enables per-page <head> management for SEO metadata,
     * Open Graph tags, canonical URLs, and JSON-LD structured data.
     */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
