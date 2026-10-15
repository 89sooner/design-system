---
"@conductor-by-89soone/css": patch
---

Cursors now say what the text under them is.

Controls show the pointer even when you load `component.css` without the reset: buttons, switches, checkboxes, select triggers and dialog close buttons used to fall back to the arrow there, because the button pointer lived only in `cdt.reset`. Interface labels show the arrow instead of the text I-beam: `Badge` (and `StatusBadge`, `SeverityTag`), `FilterChip`, `Kbd`, meter and progress readouts, the spinner label, NavList section labels, the TopBar eyebrow and title, non-interactive timeline steps, the tab list and the date picker caption. Inside a link or control they take that control's cursor. Text selection is unchanged, so labels can still be copied, and body copy (table cells, code, descriptions, card and panel content) keeps the I-beam.

Refs: CR-057 FR-CSS-002 FR-CMP-004
