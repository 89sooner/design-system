// Refs: CR-062 FR-CMP-016 FR-CSS-004
//
// Radix keeps closed content mounted for some parts (Collapsible, Tabs) and marks it with the
// `hidden` attribute. A component rule that sets `display` on that element beats the UA's
// `[hidden] { display: none }`, so the closed part still takes space (its padding). Every element
// that carries `hidden` inside a rendered component must therefore compute to `display: none`.

const describeElement = (element: Element): string =>
  `${element.tagName.toLowerCase()}${typeof element.className === "string" && element.className.trim() !== "" ? `.${element.className.trim().split(/\s+/).join(".")}` : ""}`;

/** Lists every `[hidden]` element under `root` that the stylesheet still lays out. */
export function hiddenViolations(root: ParentNode, scope: string): string[] {
  return [...root.querySelectorAll("[hidden]")]
    .filter((element) => getComputedStyle(element).display !== "none")
    .map((element) => `${scope}: ${describeElement(element)} has hidden but display: ${getComputedStyle(element).display}`);
}
