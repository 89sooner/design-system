---
"@conductor-by-89soone/tokens": patch
"@conductor-by-89soone/css": patch
"@conductor-by-89soone/react": patch
---

Draw `Drawer` above its own scrim: `overlay.drawerZ` now resolves to `z.popover`, the layer `Dialog` already used, instead of `z.drawer`, which sat under the `z.overlay` scrim. Align the Radix primitive pins on one release train (2026-07-24) so consumer bundles carry a single copy of Radix's shared internals.

Refs: CR-058 FR-CMP-006 FR-TOK-008
