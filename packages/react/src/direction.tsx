"use client";
// FR-CSS-006 · CR-074: reading direction for every Radix-based component. Radix reads the direction from
// its own context and, without one, writes `dir="ltr"` on Tabs, RadioGroup, ToggleGroup, Select and menu
// roots, so they stayed left-to-right inside a right-to-left page and their arrow keys did not mirror.
// Conductor re-exports Radix's provider rather than wrapping it: one context instance serves every
// primitive. Set `<html dir="rtl">` as well — the stylesheet mirrors with `:dir(rtl)` and logical properties.
export { DirectionProvider, useDirection } from "@radix-ui/react-direction";
