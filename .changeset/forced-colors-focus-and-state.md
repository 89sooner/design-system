---
"@conductor-by-89soone/css": patch
---

Focus and selection now stay visible in forced colours (Windows high contrast) (CR-071). That mode removes every background and box-shadow, which is how Conductor drew its focus ring and most selected states, so keyboard focus and states such as a checked switch, the selected radio, the current page or the highlighted menu option disappeared.

- Every `:focus-visible` rule keeps a transparent outline (`var(--cdt-border-width-emphasis) solid transparent`) instead of `outline: none`. It paints nothing normally; in forced colours the browser draws it in the system colour.
- Under `@media (forced-colors: active)`, checked, selected and highlighted items fill with `Highlight` and `HighlightText`: Switch, Checkbox, RadioGroup, ToggleGroup, Pagination, segmented Tabs, the Select, Combobox, DropdownMenu and CommandPalette options, and the selected DatePicker day. The Meter fill is `Highlight`. The current Timeline step and the active NavList item take a `Highlight` rail, and selected DataTable rows take an inset `Highlight` outline.

Nothing changes outside forced colours.

Refs: CR-071 FR-A11Y-001 FR-A11Y-003 FR-CSS-002
