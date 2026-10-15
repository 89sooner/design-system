// Refs: CR-057 FR-CSS-002
//
// The cursor a person sees over text inside Conductor components. Chromium resolves `cursor:
// auto` over selectable text to the I-beam, so a control or an interface label left on `auto`
// reads as an input field. Shared by the component.css and full-bundle browser tests.

/** Keyboard-operable controls: the text inside them must show the pointer. */
const CONTROL = 'button, a[href], summary, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [role="checkbox"], [role="switch"], [role="combobox"]';

/** Interface labels outside any control: the arrow, never the I-beam. */
export const INTERFACE_LABELS = [
  ".cdt-badge",
  ".cdt-severity-tag",
  ".cdt-filter-chip",
  ".cdt-kbd",
  ".cdt-meter__value",
  ".cdt-progress-ring__label",
  ".cdt-spinner__label",
  ".cdt-nav-list__section-label",
  ".cdt-topbar__eyebrow",
  ".cdt-topbar__title",
  ".cdt-timeline__step",
  ".cdt-tabs__list",
  ".cdt-date-picker__caption-label",
] as const;

const DISABLED = ':disabled, [aria-disabled="true"], [data-disabled]';

const firstTextHost = (element: Element): Element | null => {
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
  });
  return walker.nextNode()?.parentElement ?? null;
};

const describe = (element: Element): string =>
  `${element.tagName.toLowerCase()}${element.getAttribute("role") ? `[role=${element.getAttribute("role")}]` : ""}${typeof element.className === "string" && element.className ? `.${element.className.trim().split(/\s+/)[0]}` : ""}`;

/** Every cursor that breaks the contract under `root`, as readable strings. */
export function cursorViolations(root: ParentNode, scope: string): string[] {
  const violations: string[] = [];
  for (const control of root.querySelectorAll(CONTROL)) {
    if (!control.matches('[class*="cdt-"], [class*="cdt-"] *') || control.matches(DISABLED) || control.closest(DISABLED)) continue;
    const host = firstTextHost(control);
    if (host === null) continue;
    const cursor = getComputedStyle(host).cursor;
    if (cursor !== "pointer") violations.push(`${scope}: ${describe(control)} "${host.textContent?.trim().slice(0, 20)}" cursor=${cursor}`);
  }
  for (const label of root.querySelectorAll(INTERFACE_LABELS.join(", "))) {
    if (label.closest(CONTROL) || label.matches(".cdt-timeline__step--interactive")) continue;
    const host = firstTextHost(label);
    if (host === null || host.closest(CONTROL)) continue;
    const cursor = getComputedStyle(host).cursor;
    if (cursor !== "default") violations.push(`${scope}: ${describe(label)} "${host.textContent?.trim().slice(0, 20)}" cursor=${cursor}`);
  }
  return violations;
}
