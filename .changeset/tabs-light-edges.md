---
"@conductor-by-89soone/tokens": minor
"@conductor-by-89soone/css": minor
---

Tabs mark the selected tab with one straight accent line that sits on the list's divider, instead of a filled box whose inset underline bent around its rounded corners and floated above the divider. Hover is a wash that stops short of the divider; vertical tabs put the same line on the inline-end edge; forced-colours mode redraws it in `Highlight`.

The light theme's edges now follow the dark theme's weight ladder (CR-065). `border.subtle`, `border.default` and `border.strong` are translucent ink (`rgba(12, 18, 28, 0.07 / 0.12 / 0.2)`, 1.15 / 1.29 / 1.55:1 on `surface.raised`) instead of opaque mid greys (up to 5.52:1) that drew cards and panels as heavily as inputs. `border.control` is `rgba(12, 18, 28, 0.5)` and still clears 3:1 on every surface (3.40–3.51).

Badge chips are a tint over the parent surface, so they stay visible on near-white light cards and rows. The table header steps toward the text colour: lighter than the rows in dark (as before), darker in light.

Refs: CR-065 FR-THM-002 FR-CMP-013 DEV-062
