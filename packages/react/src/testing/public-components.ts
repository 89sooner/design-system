/**
 * The one registry every later work package extends when it exports a React component.
 *
 * WP-011 deliberately exports no components. Keeping the registry explicit means a future
 * component cannot be marked public without also declaring the test file that owns its contract.
 */
import { createElement, type ReactElement } from "react";
import { Button, IconButton } from "../action";
import { Card, CardGrid, Panel } from "../surface";

export interface PublicComponent {
  readonly name: string;
  readonly testFile: string;
  readonly render: () => ReactElement;
}

export const publicComponents: readonly PublicComponent[] = [
  { name: "Button", testFile: "testing/action.test.tsx", render: () => createElement(Button, null, "Button") },
  { name: "IconButton", testFile: "testing/action.test.tsx", render: () => createElement(IconButton, { "aria-label": "Icon", icon: "●" }) },
  { name: "Card", testFile: "testing/surface.test.tsx", render: () => createElement(Card, null, "Card") },
  { name: "CardGrid", testFile: "testing/surface.test.tsx", render: () => createElement(CardGrid) },
  { name: "Panel", testFile: "testing/surface.test.tsx", render: () => createElement(Panel) },
];

export function missingComponentTests(
  components: readonly PublicComponent[],
  availableTestFiles: readonly string[],
): string[] {
  const known = new Set(availableTestFiles);
  return components.filter((component) => !known.has(component.testFile)).map((component) => component.name);
}
