---
"@conductor-by-89soone/tokens": minor
"@conductor-by-89soone/css": minor
"@conductor-by-89soone/react": minor
---

Visual change: one fill for every field, a rail on the selected DataTable row, wrapping table cells and fitted RelationGraph labels; new `FileUpload`; Tree type-ahead (CR-080). This release is the new 1.0 candidate.

- **Visual:** `input.background` and `input.backgroundFocus` are now `surface.raised` in dark. TextField, TextArea, Select, NumberInput, PromptInput, Switch, Checkbox, RadioGroup, ToggleGroup and FilterChip all paint that one token. In dark, NumberInput, PromptInput and the choice controls get lighter; in light, TextField, TextArea and Select move from `#fcfdfe` to `#fff`.
- **Visual:** a selected `DataTable` row carries an accent rail at the start of its first cell. In right-to-left documents the rail is on the right.
- **Visual:** `Table` cells wrap long identifiers (`overflow-wrap: anywhere`) instead of widening the table.
- **Visual:** `RelationGraph` cuts node labels at 24 columns and edge labels at 20, where wide characters (Hangul, CJK, emoji) count two. The full text stays in the title, the detail panel and the table.
- **New `FileUpload`:** the browser's own file input sits invisibly over a "Choose files" face, so the role, name, keyboard and system picker are native.
  - Drop zone, plus `accept` / `maxSize` / `maxFiles` checks. Files left out go to `onFilesReject` and are announced in a status line.
  - A list of the chosen files with remove buttons. Removing a file returns focus to the file input.
  - Works with `Field`. Use it controlled (`files`, `onFilesChange`) or uncontrolled (`defaultFiles`).
  - It does not upload anything: send the files yourself.
- **`Tree` type-ahead:** a letter or digit moves focus to the next visible row starting with it. Keys typed within 500ms build a prefix, and repeating a letter cycles through matches. Selection does not change. IME composition is ignored.
- **Dependency updates:**
  - Radix primitives move to their 2026-10-12 releases, all together, so their shared modules stay single-version.
  - `@headless-tree/core` 1.8.0 and `react-day-picker` 10.0.2.

Refs: CR-080 WP-047 FR-CMP-019
