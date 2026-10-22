---
"@conductor-by-89soone/tokens": minor
"@conductor-by-89soone/css": minor
"@conductor-by-89soone/react": minor
---

Readability fixes found while building a PR investigation workbench on Conductor.

- **Placeholders are readable text.** New role token `text.placeholder` (the same value as `text.muted` in both themes, so no new colour); `input.placeholder` now points to it instead of the decorative `text.faint`. Placeholders measure 5.22:1 (dark) and 6.81:1 (light) on the `surface.raised` fill fields actually paint, up from 3.22:1 and 4.36:1. `NumberInput` gets the placeholder colour too (it showed the browser's default grey), and `PromptInput`'s placeholder no longer takes the browser's placeholder opacity. Two new contrast pairs, CP-122 and CP-123, check it.
- **Badges and row buttons do not break.** `.cdt-badge` is `white-space: nowrap`, and so is a button inside a table cell, so "merged" and "Preview" no longer split across lines in narrow columns. Cell text still wraps.
- **DataTable** rows carry `data-row-id`, columns take an optional `minInlineSize`, and `stateAction` puts a retry (or any next step) in the error/partial banner. The pressed button of the selected row reads as primary text (it measured 4.34:1 in dark), and sortable headers keep the header's type.
- **StatusBadge** takes `appearance="plain"`: status-coloured icon and full-contrast text without the chip, for rows that already hold a Badge. `chip` stays the default.
- **WorkbenchLayout** keeps the inspector in view while the results scroll in the split layout (inside `AppShell` it sits below the top bar). Below the `md` breakpoint it still stacks under the results.

Refs: CR-064 DEV-061 FR-THM-005 FR-CMP-004 FR-CMP-010
