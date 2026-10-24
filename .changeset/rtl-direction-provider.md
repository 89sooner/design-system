---
"@conductor-by-89soone/react": minor
---

Add `DirectionProvider` and `useDirection` for right-to-left apps (CR-074). Radix writes `dir="ltr"` on its roots when no direction reaches it, so in a `dir="rtl"` document Tabs, RadioGroup, ToggleGroup and Select were laid out left to right and their arrow keys ran backwards. Wrap the app in `<DirectionProvider dir="rtl">` (a re-export of `@radix-ui/react-direction`, the same instance every Radix primitive reads) and those roots become `dir="rtl"`, with ArrowLeft moving to the next item. The DatePicker calendar follows the same direction.

Without a provider nothing changes. `Toast.Provider` keeps its own `swipeDirection`; pass `"left"` in a right-to-left app.

Refs: CR-074 FR-CSS-006
