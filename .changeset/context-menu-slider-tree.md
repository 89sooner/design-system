---
"@conductor-by-89soone/react": minor
"@conductor-by-89soone/css": minor
---

Add `ContextMenu`, `Slider` and `Tree` (CR-078, FR-CMP-018). Nothing existing changes: the public surface report only gains entries.

- `ContextMenu` (`Root`, `Trigger`, `Content`, `Item`, `Label`, `Separator`) is Radix Context Menu: it opens at the pointer on right-click or long press, and on Shift+F10 or the context-menu key over a focused area. It shares DropdownMenu's `cdt-menu` surface; items take `tone`, `icon` and a text `shortcut`. New dependency: `@radix-ui/react-context-menu@2.3.7`, from the same Radix release as the primitives already in use.
- `Slider` is Radix Slider: one value, or a range of two. The name you pass (`aria-label` or `aria-labelledby`) goes on each thumb, and a range adds `Minimum`/`Maximum` (`labels`, `SliderLabels`). `valueText` reads the value in words and follows an uncontrolled slider. New dependency: `@radix-ui/react-slider@1.4.7`.
- `Tree` renders nested `items` as a WAI-ARIA tree: one tab stop, arrow keys to move and open or close branches, Home/End, and Enter, Space or click to select (`selectedId`, `defaultSelectedId`, `onSelectedIdChange`). Rows render on the server too. Keyboard and ARIA behaviour come from `@headless-tree/core@1.7.0` (new dependency, MIT, no dependencies of its own).
- New stylesheet classes: `cdt-context-menu*`, `cdt-slider*`, `cdt-tree*`.

Refs: CR-078 WP-045 FR-CMP-018
