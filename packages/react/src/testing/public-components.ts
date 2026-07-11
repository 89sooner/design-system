/**
 * The one registry every later work package extends when it exports a React component.
 *
 * WP-011 deliberately exports no components. Keeping the registry explicit means a future
 * component cannot be marked public without also declaring the test file that owns its contract.
 */
import { createElement, type ReactElement } from "react";
import { Button, IconButton } from "../action";
import { Card, CardGrid, Panel } from "../surface";
import { Badge, SeverityTag, StatusBadge } from "../status";
import { CodeBlock, Kbd, Table, Timeline } from "../data";
import { Dialog, Drawer, DropdownMenu, Tooltip } from "../overlay";
import { Checkbox, Field, Select, Switch, TextArea, TextField } from "../form";
import { Banner, EmptyState, Meter, ProgressRing, Spinner } from "../feedback";

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
  { name: "Badge", testFile: "testing/status.test.tsx", render: () => createElement(Badge, null, "Badge") },
  { name: "StatusBadge", testFile: "testing/status.test.tsx", render: () => createElement(StatusBadge, { status: "running", icon: "●", label: "Running" }) },
  { name: "SeverityTag", testFile: "testing/status.test.tsx", render: () => createElement(SeverityTag, { severity: "destructive", icon: "●", label: "Destructive" }) },
  { name: "Table", testFile: "testing/data.test.tsx", render: () => createElement(Table, { "aria-label": "Table", children: null }) },
  { name: "Timeline", testFile: "testing/data.test.tsx", render: () => createElement(Timeline, { children: null }) },
  { name: "CodeBlock", testFile: "testing/data.test.tsx", render: () => createElement(CodeBlock, { code: "{}" }) },
  { name: "Kbd", testFile: "testing/data.test.tsx", render: () => createElement(Kbd, null, "Esc") },
  { name: "Dialog", testFile: "testing/overlay.test.tsx", render: () => createElement(Dialog.Root, { children: null }) },
  { name: "Drawer", testFile: "testing/overlay.test.tsx", render: () => createElement(Drawer.Root, { children: null }) },
  { name: "Tooltip", testFile: "testing/overlay.test.tsx", render: () => createElement(Tooltip.Provider, { children: createElement(Tooltip.Root, { children: null }) }) },
  { name: "DropdownMenu", testFile: "testing/overlay.test.tsx", render: () => createElement(DropdownMenu.Root, { children: null }) },
  { name: "Field", testFile: "testing/form.test.tsx", render: () => createElement(Field, { label: "Field", children: createElement(TextField) }) },
  { name: "TextField", testFile: "testing/form.test.tsx", render: () => createElement(TextField, { "aria-label": "Text field" }) },
  { name: "TextArea", testFile: "testing/form.test.tsx", render: () => createElement(TextArea, { "aria-label": "Text area" }) },
  { name: "Select", testFile: "testing/form.test.tsx", render: () => createElement(Select.Root, { children: null }) },
  { name: "Switch", testFile: "testing/form.test.tsx", render: () => createElement(Switch, { "aria-label": "Switch" }) },
  { name: "Checkbox", testFile: "testing/form.test.tsx", render: () => createElement(Checkbox, { "aria-label": "Checkbox" }) },
  { name: "Banner", testFile: "testing/feedback.test.tsx", render: () => createElement(Banner, { children: "Banner" }) },
  { name: "EmptyState", testFile: "testing/feedback.test.tsx", render: () => createElement(EmptyState, { title: "Empty" }) },
  { name: "Meter", testFile: "testing/feedback.test.tsx", render: () => createElement(Meter, { value: 0, valueText: "0%", "aria-label": "Meter" }) },
  { name: "ProgressRing", testFile: "testing/feedback.test.tsx", render: () => createElement(ProgressRing, { value: 0, valueText: "0%", "aria-label": "Progress" }) },
  { name: "Spinner", testFile: "testing/feedback.test.tsx", render: () => createElement(Spinner, { label: "Loading" }) },
];

export function missingComponentTests(
  components: readonly PublicComponent[],
  availableTestFiles: readonly string[],
): string[] {
  const known = new Set(availableTestFiles);
  return components.filter((component) => !known.has(component.testFile)).map((component) => component.name);
}
