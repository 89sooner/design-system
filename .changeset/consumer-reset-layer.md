---
"@conductor-by-89soone/css": patch
---

The README now explains how to keep a global reset below Conductor when you use the reset-free `component.css` entry point (CR-069). An unlayered element rule such as `button { font: inherit; }` outranks every `cdt.*` layer and replaces the weight and size of Conductor buttons, tabs and inputs. Declare `@layer app.reset, cdt;` in a file imported before the Conductor stylesheet and put element-wide rules in `@layer app.reset { … }`. No stylesheet change.

Refs: CR-069 FR-CSS-001
