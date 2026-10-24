---
"@conductor-by-89soone/react": minor
"@conductor-by-89soone/css": minor
---

Visual change: agent and system turns span the row, a new `participant` message role, and no focus ring on the app shell's main (CR-077).

- `Message` now takes `from="participant"` for another person in a shared conversation. It starts at the leading edge with the same bubble shape as `user`, on the raised surface with a hairline border, and is a group named by `name` (default label `Participant`, `MessageLabels.participant`). New class: `cdt-message--participant`.
- The body of an `assistant` or `system` turn fills the row beside the avatar, so tool cards and code blocks line up from turn to turn even when the text is short. `user` and `participant` bubbles still shrink to their text, up to `80ch`.
- `AppShell`'s `<main>` no longer draws the focus ring, or the forced-colours outline, when the skip link or a route change moves focus to it. It is a landmark, not a control; the next Tab lands on a control inside it, which shows its own ring. Apps that hid the ring with `.cdt-app-shell__main:focus-visible { outline: none; box-shadow: none }` can delete that rule.
- If you widened agent turns yourself (`.cdt-message:not(.cdt-message--user) .cdt-message__body { width: 100% }`), you can delete that rule too.

Refs: CR-077 WP-043 FR-CMP-016 FR-CMP-009 FR-DX-006
