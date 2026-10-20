---
"@conductor-by-89soone/css": patch
---

A closed `Tool` card no longer leaves a 12px strip under its header. Radix keeps closed Collapsible content mounted with the `hidden` attribute, and `.cdt-tool__content { display: grid }` overrode it; the closed content of `Reasoning`, `Tool` and `Sources` now computes to `display: none`.

Refs: CR-062 FR-CMP-016
