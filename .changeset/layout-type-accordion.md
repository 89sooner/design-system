---
"@conductor-by-89soone/react": minor
"@conductor-by-89soone/css": minor
---

Add six building blocks for layout, type and disclosure (CR-076, FR-CMP-017): `Separator`, `Stack`, `Grid`, `Heading`, `Text` and `Accordion`.

- `Stack` lays children out on one axis; `Grid` fits as many columns as the card grid's minimum width allows, or a fixed count of 1–6 that collapses to one column below `md`. Both take their gap as a space step (`gap={1}` … `gap={8}`) and render as `div`, `section`, `ul`, `ol`, `nav`, `header` or `footer`.
- `Separator` is a native `<hr>`, horizontal or vertical, optionally decorative.
- `Heading` takes the document `level` (1–6) and, separately, a visual `size` (`page`, `section`, `sub`, `minor`), so the outline and the look no longer have to match.
- `Text` sets a type-scale `size`, a text `tone`, a `weight` and an optional monospaced face.
- `Accordion` (`Root`, `Item`, `Trigger`, `Content`) is Radix Accordion: single or multiple sections, triggers inside headings (`level`, default 3), arrow keys between triggers. New dependency: `@radix-ui/react-accordion@1.2.20`, from the same release as the Collapsible already in use.

Every option is a `cdt-*` class (`cdt-stack--gap-3`, `cdt-grid--cols-2`, `cdt-heading--section`, `cdt-text--muted`, …), so the stylesheet reproduces them without React. Layout and type components use no hooks and render on the server as they are.

Refs: CR-076 FR-CMP-017 WP-044
