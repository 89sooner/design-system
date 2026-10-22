---
"@conductor-by-89soone/react": minor
"@conductor-by-89soone/css": minor
---

`Tabs.List` is a segmented control by default: a recessed `surface.base` track with the selected tab raised as a `surface.elevated` pill, and no rule or indicator under the list (CR-067). Every tab keeps the same weight, so selecting one never shifts its neighbours. The underline form from 0.13.0 stays available as `<Tabs.List variant="line">` (class `cdt-tabs__list--line`) for section navigation across a page. The new `TabsListProps` type is exported. This follows shadcn/ui (segmented by default, `line` variant), Radix Themes (underline Tabs, separate SegmentedControl), Mantine (`default`/`outline`/`pills`) and GitHub Primer (UnderlineNav for page navigation, SegmentedControl for switching views).

Refs: CR-067 FR-CMP-013
