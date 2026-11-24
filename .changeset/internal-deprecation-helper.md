---
"@conductor-by-89soone/react": patch
---

Internal only, no change to what you install: the source gains a development-build deprecation helper for future deprecations (FR-DX-006 AC-3). It is not exported and nothing calls it yet, so the built package is byte-identical to 0.21.0.

Refs: CR-082 WP-043 FR-DX-006
