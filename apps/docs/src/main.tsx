import "@conductor-by-89soone/css";
import "./docs.css";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./App";

const container = document.getElementById("root")!;
const app = <StrictMode><HashRouter><App /></HashRouter></StrictMode>;

const hashRoute = window.location.hash.replace(/^#/, "") || "/";
const matchesPrerenderedRoute = hashRoute === "/";

if (container.hasChildNodes() && matchesPrerenderedRoute) hydrateRoot(container, app);
else {
  container.replaceChildren();
  createRoot(container).render(app);
}
