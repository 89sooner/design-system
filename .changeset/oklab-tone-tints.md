---
"@conductor-by-89soone/tokens": patch
"@conductor-by-89soone/css": patch
---

Derive the secondary tone-button tints in OKLab at build time. New semantic tokens `tone.accent.*` and `tone.danger.*` (`background`, `border`, `backgroundHover`, `borderHover`) hold the tone mixed over `surface.raised` at the same weights the stylesheet used, but mixed in OKLab instead of gamma sRGB and emitted as plain hex per theme. The stylesheet reads them instead of `color-mix(in srgb, …)`, so the tints no longer depend on browser colour-space support and the four fills are now contrast-checked (`text.primary` on each, CP-118–CP-121, 13.67:1 and up). Rest-state colours move by at most 4.9/255 per channel.

Refs: CR-050 FR-THM-004 FR-TOK-001 FR-CMP-002
