---
"@conductor-by-89soone/react": minor
"@conductor-by-89soone/css": minor
---

Four new components. `Toast` (Provider, Viewport, Root with `tone` and `icon`, Title, Description, Action, Close) wraps Radix Toast. `DatePicker` is a single-date field that opens a react-day-picker calendar in a Radix popover, reads its label, description and error from `Field`, and takes `disabledDays`, `startMonth`/`endMonth`, `locale` and `formatDate`. `CommandPalette` is a Radix dialog over a downshift combobox with grouped commands, keywords and shortcut chips; it returns focus to whatever opened it. `Pagination` renders previous/next and page buttons with `aria-current="page"` and ellipses. Every one takes `labels` with English defaults. `filterCommands` and `paginationRange` are exported as pure helpers. Styles live in the stylesheet's component layer.

New dependencies, pinned exactly: `@radix-ui/react-toast@1.2.23` and `react-day-picker@10.0.1`.

Refs: CR-054 FR-CMP-014
