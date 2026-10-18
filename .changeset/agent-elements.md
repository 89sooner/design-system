---
"@conductor-by-89soone/react": minor
"@conductor-by-89soone/css": minor
---

Agent interface components, modelled on the AI Elements set but built on Conductor tokens and Radix with plain props that are not tied to any AI SDK. `Conversation` is a `role="log"` transcript that stays pinned to the newest message and offers "Scroll to latest" when the reader scrolls up. `Message` (`from`, `name`, `avatar`, `status="streaming" | "error"`, `actions`) is a group named by its sender. `PromptInput` is an auto-growing composer: Enter sends (never while an IME composition is open), Shift+Enter adds a line, `submitOn="mod-enter"` requires ⌘/Ctrl, and the send button becomes Stop while `status` is `submitted` or `streaming`. `Reasoning` opens while `streaming` and closes once it ends ("Thought for N seconds"). `Tool` shows a tool call's name, a text status badge, JSON parameters, result and error. `Confirmation` collects an approve or reject decision and then shows the outcome. `Sources` lists the links an answer used, `InlineCitation` opens one source in a popover, `Suggestions`/`Suggestion` offer one-click prompts and `Shimmer` marks an in-progress status line. Every built-in string can be replaced through `labels`. No new dependencies.

Refs: CR-061 FR-CMP-016
