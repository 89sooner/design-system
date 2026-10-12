---
"@conductor-by-89soone/tokens": minor
"@conductor-by-89soone/css": minor
---

Expand the motion vocabulary. New easing primitives `ease.exit`, `ease.emphasized` and `ease.spring` (a damped spring sampled into CSS `linear()`), and new motion tokens `motion.instant` (90ms), `motion.exit` (160ms), `motion.slow` (420ms), `motion.spring` (520ms, entrances only) and `motion.stagger` (45ms, a delay step with no easing). `overlay.exit` now reads `motion.exit`. All new tokens are zeroed under `prefers-reduced-motion: reduce`.

The stylesheet uses them: Dialog, Menu, Select, Popover, Banner and the checkbox mark settle on the spring; drawers and the mobile navigation enter on the emphasized curve; every closed state leaves on the accelerating exit curve. Trigger-anchored popovers slide out from their Radix `data-side`, Popover gains entrance/exit motion and a transform origin, Tabs and Collapsible content fade into place, the switch thumb settles on `motion.bounce` and the button press reacts on `motion.instant`. Browsers without `linear()` get a cubic-bezier spring of the same length.

Refs: CR-047 FR-CSS-005 FR-CMP-006 FR-CMP-007 FR-CMP-008
