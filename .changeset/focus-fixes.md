---
"@conductor-by-89soone/react": patch
"@conductor-by-89soone/css": patch
---

Two focus fixes found by adopting the packages in agent-ai-platform.

`component.css` now draws the focus ring on its own. The ring used to live only in `cdt.reset`, which that entry point leaves out, so nav items, the skip link, table scroll regions, code blocks, interactive timeline steps and the summaries and links the package renders fell back to the browser's outline. A zero-specificity rule for Conductor elements and their descendants opens the component layer, so any later component rule that sets `box-shadow` still wins as it did over the reset. The table scroll region's inset highlight also covered the ring in the full stylesheet; its focus state now restates the ring. If you layer your own focus styles below `cdt`, they now sit under this rule rather than over the reset.

A route change made from inside an open `DropdownMenu`, `Popover`, `Dialog` or `Drawer` within `AppShell` now leaves focus on `<main>` instead of the overlay's trigger. Pass your own `onCloseAutoFocus` and call `preventDefault()` to keep choosing where focus goes.

Refs: CR-056 FR-CSS-002 FR-CMP-009 FR-A11Y-001 FR-A11Y-002
