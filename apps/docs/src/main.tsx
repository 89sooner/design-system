import "@conductor-by-89soone/css";
import "./docs.css";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./App";
import { PRERENDER_THEME, readTheme } from "./theme";

const container = document.getElementById("root")!;

const hashRoute = window.location.hash.replace(/^#/, "") || "/";
const matchesPrerenderedRoute = hashRoute === "/";
const hydrating = container.hasChildNodes() && matchesPrerenderedRoute;

// Only the hydrating path is constrained to the prerender's theme; a fresh mount can render the
// visitor's real theme immediately, so the toggle never shows the wrong icon for a frame.
const app = (
  <StrictMode>
    <HashRouter>
      <App initialTheme={hydrating ? PRERENDER_THEME : readTheme(window)} />
    </HashRouter>
  </StrictMode>
);

if (hydrating) hydrateRoot(container, app);
else {
  container.replaceChildren();
  createRoot(container).render(app);
}
