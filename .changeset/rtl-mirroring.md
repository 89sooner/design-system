---
"@conductor-by-89soone/css": patch
---

Right-to-left documents now mirror the parts that still moved on the physical axis, and code stays readable (CR-074).

- The Switch thumb, the mobile navigation's entrance and a leaving toast flip their `translateX` under `:dir(rtl)`. The Conversation "scroll to latest" button centres with physical `left: 50%`, which `translateX(-50%)` undoes in either direction. The skip link uses `inset-inline-start`.
- `cdt-code-block__pre`, `cdt-kbd`, `cdt-mono` and `cdt-tool__name` are `direction: ltr; unicode-bidi: isolate`, and `cdt-command__shortcut` is `direction: ltr`. Before, the bidi algorithm reordered their punctuation: `"limit": 5` rendered as `limit": 5"` and `⌘K` as `K⌘`.

Nothing changes in left-to-right documents.

Refs: CR-074 FR-CSS-006
