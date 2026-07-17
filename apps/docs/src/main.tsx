import "@conductor-by-89soone/css";
import "./docs.css";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

const container = document.getElementById("root")!;
const app = <StrictMode><BrowserRouter basename={import.meta.env.BASE_URL}><App /></BrowserRouter></StrictMode>;

const normalizedPath = (path: string) => path.replace(/\/+$/, "");
const matchesPrerenderedRoute = normalizedPath(window.location.pathname) === normalizedPath(import.meta.env.BASE_URL);

if (container.hasChildNodes() && matchesPrerenderedRoute) hydrateRoot(container, app);
else {
  container.replaceChildren();
  createRoot(container).render(app);
}
