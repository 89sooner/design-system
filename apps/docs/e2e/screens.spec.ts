// Refs: QA-001 QA-002 QA-003 QA-004 QA-005 QA-006 QA-007 QA-008 QA-200 CR-043
import { expect, test, type Locator } from "@playwright/test";
import { docsPath } from "./routes";

const screens = [
  ["W-001", "/", "Conductor Design System"],
  ["W-002", "/getting-started", "Getting Started"],
  ["W-010", "/foundations/color", "Color"],
  ["W-011", "/foundations/typography", "Typography"],
  ["W-012", "/foundations/spacing", "Spacing & Layout"],
  ["W-013", "/foundations/elevation", "Radius & Elevation"],
  ["W-014", "/foundations/motion", "Motion"],
  ["W-020", "/components", "Components"],
  ["W-021", "/components/Button", "Button"],
  ["W-030", "/tokens/reference", "Tokens"],
  ["W-040", "/guidelines", "Patterns"],
  ["W-050", "/accessibility", "Accessibility"],
] as const;

for (const theme of ["dark", "light"] as const) {
  for (const width of [560, 800, 1080] as const) {
    test(`QA-001, QA-002, QA-005 through QA-008: ${theme} screens fit at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((selectedTheme) => window.localStorage.setItem("conductor-theme", selectedTheme), theme);

      for (const [screen, path, heading] of screens) {
        await test.step(screen, async () => {
          await page.goto(docsPath(path));
          await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
          await expect(page.locator("html")).toHaveAttribute("data-cdt-theme", theme);

          const geometry = await page.evaluate(() => {
            const main = document.querySelector("main");
            if (main === null) return null;
            const rect = main.getBoundingClientRect();
            const safeScrollers = ".cdt-table__scroll, .cdt-code-block";
            // A control scrolled out of sight inside a package-owned scroll container is not clipped: `Table` and
            // `CodeBlock` own their horizontal scroll (FR-CMP-005 AC-1, AC-4; QA-005). The exemption is behavioural —
            // scroll that container alone to centre the control and require it to land inside the viewport and every
            // ancestor that clips on the inline axis. Start-side overflow, content that escapes the scroller, and a
            // further clip in between all stay outside and still fail. The scroll position is restored.
            const clipsInline = (element: Element) => {
              const style = getComputedStyle(element);
              return style.overflowX !== "visible" || /paint|content|strict/.test(style.contain);
            };
            // The inline window an element can be seen through: the viewport cut by every clipping ancestor.
            const visibleWindow = (element: Element) => {
              let left = 0;
              let right = window.innerWidth;
              for (let ancestor = element.parentElement; ancestor !== null; ancestor = ancestor.parentElement) {
                if (!clipsInline(ancestor)) continue;
                const clip = ancestor.getBoundingClientRect();
                left = Math.max(left, clip.left);
                right = Math.min(right, clip.right);
              }
              return { left, right };
            };
            const reachableByScrolling = (element: HTMLElement) => {
              // A clip-path region cannot be measured from boxes, so a control under one gets no exemption.
              for (let node: Element | null = element; node !== null; node = node.parentElement) {
                if (getComputedStyle(node).clipPath !== "none") return false;
              }
              const scroller = element.parentElement?.closest<HTMLElement>(safeScrollers);
              if (!scroller || !["auto", "scroll"].includes(getComputedStyle(scroller).overflowX)) return false;
              const saved = scroller.scrollLeft;
              const before = element.getBoundingClientRect();
              const box = scroller.getBoundingClientRect();
              scroller.scrollTo({ left: saved + (before.left - box.left) - (scroller.clientWidth - before.width) / 2, behavior: "instant" });
              const after = element.getBoundingClientRect();
              const view = visibleWindow(element);
              scroller.scrollTo({ left: saved, behavior: "instant" });
              return after.left >= view.left - 1 && after.right <= view.right + 1;
            };
            const clipped = Array.from(main.querySelectorAll<HTMLElement>("a, button, input, textarea, [role='switch'], [role='progressbar'], h1, h2"))
              .filter((element) => {
                const style = getComputedStyle(element);
                if (style.display === "none" || style.visibility === "hidden") return false;
                const bounds = element.getBoundingClientRect();
                return bounds.width > 0 && (bounds.left < -1 || bounds.right > window.innerWidth + 1) && !reachableByScrolling(element);
              })
              .map((element) => element.textContent?.trim() || element.getAttribute("aria-label") || element.tagName);
            const unsafeOverflow = Array.from(main.querySelectorAll<HTMLElement>(safeScrollers))
              .filter((element) => element.scrollWidth > element.clientWidth && !["auto", "scroll"].includes(getComputedStyle(element).overflowX))
              .map((element) => element.className);
            // The scroll container itself must be fully visible, or part of its content is cut at every offset.
            const cutScrollers = Array.from(main.querySelectorAll<HTMLElement>(safeScrollers))
              .filter((element) => {
                if (!element.checkVisibility()) return false;
                const box = element.getBoundingClientRect();
                const view = visibleWindow(element);
                return box.width > 0 && (box.left < view.left - 1 || box.right > view.right + 1);
              })
              .map((element) => element.className);
            return {
              clipped,
              cutScrollers,
              documentWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
              mainLeft: rect.left,
              mainRight: rect.right,
              unsafeOverflow,
              viewportWidth: window.innerWidth,
            };
          });

          expect(geometry).not.toBeNull();
          expect(geometry?.documentWidth).toBeLessThanOrEqual(width + 1);
          expect(geometry?.mainLeft).toBeGreaterThanOrEqual(-1);
          expect(geometry?.mainRight).toBeLessThanOrEqual(width + 1);
          expect(geometry?.clipped).toEqual([]);
          expect(geometry?.unsafeOverflow).toEqual([]);
          expect(geometry?.cutScrollers).toEqual([]);
          expect((await page.locator("body").innerText()).toLowerCase()).not.toMatch(/permission denied|session expired|sign in to continue/);

          if (process.env.CONDUCTOR_SCREEN_AUDIT === "1" && theme === "dark" && width === 1080) {
            await page.waitForTimeout(100);
            await page.screenshot({ path: `/tmp/conductor-${screen}.png`, fullPage: false });
          }
        });
      }
    });
  }
}

for (const theme of ["dark", "light"] as const) {
  test(`QA-003, QA-004: ${theme} screen controls follow DOM order and use the focus-ring token`, async ({ page }) => {
    await page.setViewportSize({ width: 1080, height: 900 });
    await page.addInitScript((selectedTheme) => window.localStorage.setItem("conductor-theme", selectedTheme), theme);

    for (const [screen, path, heading] of screens) {
      await test.step(screen, async () => {
        await page.goto(docsPath(path));
        await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
        // Lists the content area's Tab stops in DOM order and tags them. It runs again after each roving walk:
        // a walk can change the selection and remount panel content, which drops the tags.
        const listStops = (main: Element) => {
          const selector = "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), details > summary:first-of-type, [tabindex]:not([tabindex='-1'])";
          // A Radix roving-focus group (ADR-004, ADR-011, FR-CMP-013) is one Tab stop: the root holds tabindex=0 only
          // to hand focus to the item Radix picks on entry, and until then every item sits at tabindex=-1. The root is
          // listed whatever its tabindex, so a group Tab cannot enter still fails, and only Radix's registered items are
          // left out — any other control inside the group stays listed. The items are walked with the arrow keys below.
          const rovingRoot = "[data-orientation]:is([role='tablist'], [role='toolbar'], [role='radiogroup'], [role='menubar'])";
          const rovingItem = "[data-radix-collection-item]";
          const focusable = Array.from(main.querySelectorAll<HTMLElement>(`${selector}, ${rovingRoot}`)).filter((element) => {
            const style = getComputedStyle(element);
            // checkVisibility() also drops the content of a closed <details> (content-visibility: hidden), which
            // still reports client rects but is not in the Tab sequence.
            if (style.display === "none" || style.visibility === "hidden" || element.getClientRects().length === 0 || !element.checkVisibility() || element.closest("[aria-hidden='true']") !== null) return false;
            if (element.matches(rovingItem) && element.parentElement?.closest(rovingRoot) != null) return false;
            // Radix drops the root's tab stop when every item is disabled; such a group has nothing to reach.
            if (element.matches(rovingRoot)) return element.querySelector(`${rovingItem}:not([disabled]):not([data-disabled])`) !== null;
            return true;
          });
          main.querySelectorAll<HTMLElement>("[data-screen-focus-index]").forEach((element) => {
            delete element.dataset.screenFocusIndex;
            delete element.dataset.screenRoving;
          });
          focusable.forEach((element, index) => {
            element.dataset.screenFocusIndex = String(index);
            if (element.matches(rovingRoot)) element.dataset.screenRoving = "";
          });
          return focusable.length;
        };
        const content = page.locator("#content");
        const count = await content.evaluate(listStops);
        await content.evaluate((main) => (main as HTMLElement).focus());

        const expectFocusRing = async (focused: Locator) => {
          const focusStyle = await focused.evaluate((element) => ({
            boxShadow: getComputedStyle(element).boxShadow,
            focusVisible: element.matches(":focus-visible"),
          }));
          expect(focusStyle.focusVisible).toBe(true);
          expect(focusStyle.boxShadow).not.toBe("none");
        };

        // For a roving group the focus must land on one of its items (a descendant), never on the root itself.
        // The explicit timeout makes a lost tag fail fast with the stop's index instead of the test timeout.
        const focusTarget = async (index: number) => {
          const stop = page.locator(`[data-screen-focus-index="${index}"]`);
          return await stop.evaluate((element) => element.hasAttribute("data-screen-roving"), undefined, { timeout: 5000 }) ? stop.locator(":focus") : stop;
        };

        for (let index = 0; index < count; index += 1) {
          await page.keyboard.press("Tab");
          const stop = page.locator(`[data-screen-focus-index="${index}"]`);
          const roving = await stop.evaluate((element) => element.hasAttribute("data-screen-roving"), undefined, { timeout: 5000 });
          const focused = await focusTarget(index);
          await expect(focused).toBeFocused();
          await expectFocusRing(focused);
          if (roving) {
            // Every enabled item is reached with the arrow keys and shows the ring (FR-A11Y-002 AC-4). The walk
            // wraps back to the entry item, so the selection is restored before the next Tab.
            const walk = await stop.evaluate((root) => {
              const items = Array.from(root.querySelectorAll<HTMLElement>("[data-radix-collection-item]:not([disabled]):not([data-disabled])"));
              items.forEach((item, position) => item.dataset.screenRovingItem = String(position));
              const entry = items.indexOf(document.activeElement as HTMLElement);
              // A group is one Tab stop: only the entry item may sit in the Tab sequence.
              const extraStops = items.filter((item, position) => position !== entry && item.tabIndex >= 0).length;
              return { entry, extraStops, key: root.getAttribute("data-orientation") === "vertical" ? "ArrowDown" : "ArrowRight", size: items.length };
            });
            expect(walk.extraStops).toBe(0);
            for (let step = 1; step <= walk.size; step += 1) {
              await page.keyboard.press(walk.key);
              const item = stop.locator(`[data-screen-roving-item="${(walk.entry + step) % walk.size}"]`);
              await expect(item).toBeFocused();
              await expectFocusRing(item);
            }
            expect(await content.evaluate(listStops)).toBe(count);
            // Shift+Tab leaves the group backwards — no keyboard trap (FR-A11Y-002 AC-2) — and Tab re-enters it.
            await page.keyboard.press("Shift+Tab");
            if (index === 0) expect(await content.evaluate((main) => main.contains(document.activeElement))).toBe(false);
            else await expect(await focusTarget(index - 1)).toBeFocused();
            await page.keyboard.press("Tab");
            await expect(await focusTarget(index)).toBeFocused();
          }
        }
        // Nothing tabbable may follow the last listed stop inside the content area.
        await page.keyboard.press("Tab");
        expect(await content.evaluate((main) => main.contains(document.activeElement))).toBe(false);
      });
    }
  });
}
