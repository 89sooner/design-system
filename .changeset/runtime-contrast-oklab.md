---
"@conductor-by-89soone/tokens": minor
---

Export the build's colour arithmetic for runtime use. `contrastRatio(foreground, background)` returns the WCAG 2.1 ratio with the same parsing and compositing `conductor-check-contrast` uses, so a value measured in a browser matches the contrast report to four decimals; it reads a single colour from compound values such as a box-shadow and throws on anything it cannot measure. `toOklab`, `fromOklab`, `mixOklab` and `toneValues` are the OKLab helpers the build derives the tone tints with. Additions only; no existing export changes.

Refs: CR-052 FR-DOC-010 API-TOK-004
