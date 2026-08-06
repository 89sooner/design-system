import { expect, test } from "@playwright/test";
import { docsPath } from "./routes";

test("FR-DX-004 AC-3: prerendered shell hydrates without replacing the server DOM", async ({ page }) => {
  const hydrationMessages: string[] = [];
  page.on("console", (message) => {
    if (/hydration|hydrating|server rendered html/i.test(message.text())) hydrationMessages.push(message.text());
  });
  await page.addInitScript(() => {
    const state = { shell: null as Element | null };
    Object.defineProperty(window, "__conductorHydrationProbe", { value: state });
    const observer = new MutationObserver(() => {
      state.shell ??= document.querySelector("#root > .cdt-app-shell");
    });
    observer.observe(document, { childList: true, subtree: true });
  });

  await page.goto(docsPath("/"));
  await expect(page.locator("#root > .cdt-app-shell")).toBeVisible();
  const serverShellPreserved = await page.evaluate(() => {
    const probe = (window as Window & { __conductorHydrationProbe?: { shell: Element | null } }).__conductorHydrationProbe;
    return probe?.shell?.isConnected ?? false;
  });
  expect(serverShellPreserved).toBe(true);
  expect(hydrationMessages).toEqual([]);
});

test("FR-DX-004 exception: a deep link discards the root-only prerender without hydration warnings", async ({ page }) => {
  const hydrationMessages: string[] = [];
  page.on("console", (message) => {
    if (/hydration|hydrating|server rendered html/i.test(message.text())) hydrationMessages.push(message.text());
  });
  await page.goto(docsPath("/components/Button"));
  await expect(page.locator("#root > .cdt-app-shell")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Documentation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Button", exact: true })).toBeVisible();
  expect(hydrationMessages).toEqual([]);
});

test("FR-DOC-001 AC-1, AC-3, AC-4: static shell renders without external requests", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") externalRequests.push(request.url()); });
  await page.goto(docsPath("/"));
  await expect(page.getByRole("main")).toContainText("Conductor Design System");
  await expect(page.locator(".cdt-app-shell .cdt-topbar")).toHaveCount(1);
  await expect(page.locator(".cdt-app-shell .cdt-nav-list")).toHaveCount(1);
  expect(externalRequests).toEqual([]);
});

test("FR-DOC-005 AC-1, AC-2, AC-5: theme switch updates and persists", async ({ page }) => {
  await page.goto(docsPath("/"));
  // The switch names the theme it moves to, so the accessible name changes with state.
  const toggle = page.getByRole("switch");
  const root = page.locator("html");
  const initialTheme = await root.getAttribute("data-cdt-theme");
  const nextTheme = initialTheme === "dark" ? "light" : "dark";
  await toggle.click();
  await expect(root).toHaveAttribute("data-cdt-theme", nextTheme);
  await page.reload();
  await expect(root).toHaveAttribute("data-cdt-theme", nextTheme);
});

test("FR-THM-003 AC-2: an absent preference follows the operating-system color scheme", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("conductor-theme"));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(docsPath("/"));
  await expect(page.locator("html")).toHaveAttribute("data-cdt-theme", "dark");

  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-cdt-theme", "light");
});

test("FR-THM-003 AC-1, AC-4: an explicit theme wins without remounting components", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => window.localStorage.setItem("conductor-theme", "light"));
  await page.goto(docsPath("/"));
  await expect(page.locator("html")).toHaveAttribute("data-cdt-theme", "light");
  await page.evaluate(() => Object.defineProperty(window, "__conductorThemeNode", { configurable: true, value: document.querySelector("main") }));
  const before = await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--cdt-surface-base").trim());

  await page.getByRole("switch", { name: "Use dark theme" }).click();
  const after = await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--cdt-surface-base").trim());
  const retained = await page.evaluate(() => (window as Window & { __conductorThemeNode?: Element }).__conductorThemeNode === document.querySelector("main"));
  expect(after).not.toBe(before);
  expect(retained).toBe(true);
});

test("FR-DOC-005 exception: blocked localStorage does not prevent the shell from rendering", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get: () => { throw new Error("blocked"); } }));
  await page.goto(docsPath("/"));
  await expect(page.getByRole("main")).toContainText("Conductor Design System");
  await expect(page.locator("html")).toHaveAttribute("data-cdt-theme", "dark");
});

test("QA-012: mobile navigation closes from the overlay and Escape", async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 800 });
  await page.goto(docsPath("/"));
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator(".cdt-app-shell__overlay").click({ position: { x: 590, y: 400 } });
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

// The first render has to match the served HTML or React discards the prerender and client-renders
// the root, which is exactly the cost the prerender exists to avoid. `light` is the path at risk:
// the prerender is always drawn dark.
for (const theme of ["light", "dark"] as const) {
  test(`NFR-001: the prerendered landing page hydrates cleanly in the ${theme} theme`, async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && /hydrat/i.test(message.text())) problems.push(message.text());
    });
    page.on("pageerror", (error) => problems.push(error.message));

    await page.addInitScript((selected) => window.localStorage.setItem("conductor-theme", selected), theme);
    await page.goto(docsPath("/"));
    await expect(page.locator("html")).toHaveAttribute("data-cdt-theme", theme);
    // The toggle settles on the real theme, not the theme the prerender was drawn with.
    await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", theme === "light" ? "true" : "false");
    expect(problems).toEqual([]);
  });
}

test("DEV-026: each screen has one URL; the legacy paths redirect and keep their query", async ({ page }) => {
  await page.goto(docsPath("/tokens"));
  await expect(page).toHaveURL(/#\/tokens\/reference$/);
  await page.goto(docsPath("/patterns"));
  await expect(page).toHaveURL(/#\/guidelines$/);
  await page.goto(docsPath("/tokens?metrics-unavailable"));
  await expect(page).toHaveURL(/#\/tokens\/reference\?metrics-unavailable$/);
  await expect(page.getByRole("table", { name: "Token reference" })).toContainText("측정되지 않음");
});

test("FR-DOC-001: navigating moves focus to the main region so the keyboard path restarts there", async ({ page }) => {
  await page.goto(docsPath("/"));
  await expect(page.getByRole("main")).not.toBeFocused();
  await page.getByRole("link", { name: "Getting Started" }).first().click();
  await expect(page.getByRole("heading", { name: "Getting Started" })).toBeVisible();
  await expect(page.getByRole("main")).toBeFocused();
});

test("QA-013: skip link moves focus to the AppShell main region", async ({ page }) => {
  await page.goto(docsPath("/"));
  const skip = page.getByRole("link", { name: "Skip to content" });
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("screen navigation resets retained document scroll", async ({ page }) => {
  await page.goto(docsPath("/tokens/reference"));
  await expect(page.getByRole("heading", { name: "Tokens", exact: true })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.minHeight = "200vh";
    window.scrollTo(0, document.body.scrollHeight);
  });
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.getByRole("link", { name: "Guidelines" }).click();
  await expect(page.getByRole("heading", { name: "Patterns", exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});
