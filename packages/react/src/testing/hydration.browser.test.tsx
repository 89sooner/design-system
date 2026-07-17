// Refs: FR-DX-004 AC-3 FR-QA-002
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { publicComponents } from "./public-components";

for (const component of publicComponents) {
  test(`FR-DX-004 AC-3: ${component.name} hydrates without warnings or DOM replacement`, async () => {
    const container = document.createElement("div");
    const consoleErrors: unknown[][] = [];
    const recoverableErrors: unknown[] = [];
    const errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => consoleErrors.push(args));
    let root: Root | undefined;

    try {
      container.innerHTML = renderToString(component.render());
      const serverRoot = container.firstChild;
      document.body.append(container);

      root = hydrateRoot(container, component.render(), {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      expect(recoverableErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
      if (serverRoot !== null) {
        expect(container.firstChild).toBe(serverRoot);
        expect(serverRoot.isConnected).toBe(true);
      }
    } finally {
      root?.unmount();
      errorSpy.mockRestore();
      container.remove();
    }
  });
}
