import { expect, test } from "@playwright/test";

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

  await page.goto("/");
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
  await page.goto("/components/Button");
  await expect(page.locator("#root > .cdt-app-shell")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Documentation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Button", exact: true })).toBeVisible();
  expect(hydrationMessages).toEqual([]);
});

test("FR-DOC-001 AC-1, AC-3, AC-4: static shell renders without external requests", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") externalRequests.push(request.url()); });
  await page.goto("/");
  await expect(page.getByRole("main")).toContainText("Conductor Design System");
  await expect(page.locator(".cdt-app-shell .cdt-topbar")).toHaveCount(1);
  await expect(page.locator(".cdt-app-shell .cdt-nav-list")).toHaveCount(1);
  expect(externalRequests).toEqual([]);
});

test("FR-DOC-005 AC-1, AC-2, AC-5: theme switch updates and persists", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("switch", { name: "Toggle color theme" });
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
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-cdt-theme", "dark");

  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-cdt-theme", "light");
});

test("FR-THM-003 AC-1, AC-4: an explicit theme wins without remounting components", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => window.localStorage.setItem("conductor-theme", "light"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-cdt-theme", "light");
  await page.evaluate(() => Object.defineProperty(window, "__conductorThemeNode", { configurable: true, value: document.querySelector("main") }));
  const before = await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--cdt-surface-base").trim());

  await page.getByRole("switch", { name: "Toggle color theme" }).click();
  const after = await page.locator("html").evaluate((element) => getComputedStyle(element).getPropertyValue("--cdt-surface-base").trim());
  const retained = await page.evaluate(() => (window as Window & { __conductorThemeNode?: Element }).__conductorThemeNode === document.querySelector("main"));
  expect(after).not.toBe(before);
  expect(retained).toBe(true);
});

test("FR-DOC-005 exception: blocked localStorage does not prevent the shell from rendering", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => Object.defineProperty(window, "localStorage", { get: () => { throw new Error("blocked"); } }));
  await page.goto("/");
  await expect(page.getByRole("main")).toContainText("Conductor Design System");
  await expect(page.locator("html")).toHaveAttribute("data-cdt-theme", "dark");
});

test("QA-012: mobile navigation closes from the overlay and Escape", async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.locator(".cdt-app-shell__overlay").click({ position: { x: 590, y: 400 } });
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("QA-013: skip link moves focus to the AppShell main region", async ({ page }) => {
  await page.goto("/");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("screen navigation resets retained document scroll", async ({ page }) => {
  await page.goto("/tokens/reference");
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
