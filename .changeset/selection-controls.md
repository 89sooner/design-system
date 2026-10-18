---
"@conductor-by-89soone/react": minor
"@conductor-by-89soone/css": minor
---

Five new components. `AlertDialog` (Root, Trigger, Content, Title, Description, Footer, Cancel, Action with `tone`) wraps Radix AlertDialog for confirmations that cannot be dismissed by clicking outside; it reuses the Dialog surface. `RadioGroup` (Root, Item with `description`) wraps Radix RadioGroup and takes its name, description, error and `required` from `Field`. `ToggleGroup` (Root with `type="single" | "multiple"` and `size`, Item with `icon`) is a segmented control on Radix ToggleGroup. `Avatar` shows an image through Radix Avatar and falls back to initials from `name`, which is also its accessible name; `avatarInitials` is exported. `NumberInput` is a native `type="number"` field with a `suffix` and stepper buttons that fire `onChange` like typing; `labels` renames the buttons. `Field` now gives its label an `id`.

New dependencies, pinned to the same Radix release train as the existing primitives: `@radix-ui/react-alert-dialog@1.1.23`, `@radix-ui/react-radio-group@1.4.7`, `@radix-ui/react-toggle-group@1.1.19`, `@radix-ui/react-avatar@1.2.6`.

Refs: CR-060 FR-CMP-015
