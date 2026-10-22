---
"@conductor-by-89soone/tokens": minor
---

The light theme's surfaces are lifted and desaturated, and its shadows have two layers (CR-066). The surfaces keep the same 220° cool-neutral hue and the same base → elevated order, but sit in 0.88–1.00 relative luminance instead of 0.84–1.00 with less chroma (`surface.base` `#e8ecf2` → `#eff1f5`), so the page reads as a clean light ground instead of a grey-blue wash. `elevation.raised`, `elevation.hover` and `elevation.overlay` pair a tight contact shadow with a soft ambient one instead of the dark theme's single wide blur at a lower alpha, which read as a grey smudge under a light card. The dark theme is unchanged, and every contrast pair still passes (light `focusRing` on `surface.base` rises from 3.30 to 3.42).

Refs: CR-066 FR-THM-002
