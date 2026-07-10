import { createElement, type ForwardRefExoticComponent, type HTMLAttributes, type RefAttributes } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

/** A forwardRef component whose root receives ordinary native element attributes. */
export type ContractComponent<E extends HTMLElement, P extends HTMLAttributes<E>> =
  ForwardRefExoticComponent<P & RefAttributes<E>>;

export interface ContractProbe {
  readonly root: Element | null;
  readonly receivedRef: HTMLElement | null;
  readonly expectedClassName: string;
}

/** The assertions shared by the suite and its deliberately broken fixture. */
export function contractFailures(probe: ContractProbe): string[] {
  const failures: string[] = [];
  if (!(probe.receivedRef instanceof HTMLElement)) failures.push("ref");
  if (!probe.root?.classList.contains(probe.expectedClassName) || !probe.root.classList.contains("consumer-class")) {
    failures.push("className");
  }
  if (probe.root?.getAttribute("data-testid") !== "contract-root" || probe.root.getAttribute("aria-label") !== "Contract root") {
    failures.push("data/aria");
  }
  if (probe.root?.getAttribute("title") !== "Native title") failures.push("native props");
  return failures;
}

/**
 * Registers the four mandatory public-component checks (FR-CMP-001 AC-1~AC-4).
 * A component's own test calls this once; the registry test ensures no public component is skipped.
 */
export function runContractSuite<E extends HTMLElement, P extends HTMLAttributes<E>>(
  name: string,
  Component: ContractComponent<E, P>,
  defaultProps: P,
  expectedClassName: string,
): void {
  describe(`${name} common contract`, () => {
    afterEach(cleanup);

    test("FR-CMP-001 AC-1: ref receives the root DOM node", () => {
      let received: E | null = null;
      const { container } = render(
        createElement(Component, {
          ...defaultProps,
          className: "consumer-class",
          "data-testid": "contract-root",
          "aria-label": "Contract root",
          title: "Native title",
          ref: (node: E | null) => { received = node; },
        }),
      );
      expect(contractFailures({ root: container.firstElementChild, receivedRef: received, expectedClassName })).not.toContain("ref");
    });

    test("FR-CMP-001 AC-2: className merges with the default class", () => {
      let received: E | null = null;
      const { container } = render(createElement(Component, { ...defaultProps, className: "consumer-class", "data-testid": "contract-root", "aria-label": "Contract root", title: "Native title", ref: (node: E | null) => { received = node; } }));
      expect(contractFailures({ root: container.firstElementChild, receivedRef: received, expectedClassName })).not.toContain("className");
    });

    test("FR-CMP-001 AC-3: data and aria props reach the root DOM node", () => {
      let received: E | null = null;
      const { container } = render(createElement(Component, { ...defaultProps, className: "consumer-class", "data-testid": "contract-root", "aria-label": "Contract root", title: "Native title", ref: (node: E | null) => { received = node; } }));
      expect(contractFailures({ root: container.firstElementChild, receivedRef: received, expectedClassName })).not.toContain("data/aria");
    });

    test("FR-CMP-001 AC-4: native props are accepted and reach the root DOM node", () => {
      let received: E | null = null;
      const { container } = render(createElement(Component, { ...defaultProps, className: "consumer-class", "data-testid": "contract-root", "aria-label": "Contract root", title: "Native title", ref: (node: E | null) => { received = node; } }));
      expect(contractFailures({ root: container.firstElementChild, receivedRef: received, expectedClassName })).not.toContain("native props");
    });
  });
}
