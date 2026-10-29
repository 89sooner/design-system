---
"@conductor-by-89soone/tokens": minor
"@conductor-by-89soone/css": minor
"@conductor-by-89soone/react": minor
---

Close the gaps a pull-request investigation screen found (CR-079, FR-CMP-010 AC-7, FR-CMP-011 AC-6, FR-CMP-014 AC-6). Existing props, classes and visuals stay as they are: the public surface report only gains entries, and `layoutRelationNodes` gains an optional second argument.

- `CommandPalette` no longer runs a command on the Enter that confirms an IME composition (Korean, Japanese, Chinese input). It used to run the highlighted command when the browser reported `isComposing` with key code 13.
- `Command` takes `description`, a second line such as the item the command acts on, and `disabledReason`, shown in its place while the command is `disabled`. Both are part of the option's accessible name; `filterCommands` does not search them. A command without either renders the same markup as before.
- `DataTable` takes `fit`: `"scroll"` (default, unchanged) keeps the table's minimum width below the md breakpoint and scrolls inside its frame; `"columns"` drops that minimum for an app that folds low-priority columns into the row on narrow screens.
- New token `workbench.stickyOffset` (`--cdt-workbench-sticky-offset`, `0px`): the space a sticky app bar takes above the pinned inspector. `AppShell` sets it to `topBar.minHeight`, as before; another app sets it on an ancestor of the workbench instead of overriding the inspector.
- `RelationEdge.inferred` marks an edge derived from metadata rather than declared. It is labelled `Inferred` (`RelationGraphLabels.inferred`), drawn dash-dot (`data-state="inferred"`), explained in the legend (`legendInferred`) and never called confirmed.
- `RelationGraph` takes `layout="focus"` with `focusId`: items that point to the focused item on the left, items it points to on the right, the rest in the grid below; rows follow relation type, then ID. `layoutRelationNodes(nodes, { layout, focusId, edges })` (new type `RelationLayoutOptions`) computes the same placement. The default `grid` is unchanged.
- New stylesheet classes and attribute: `cdt-command__text`, `cdt-command__description`, `data-fit`.

Refs: CR-079 WP-046 FR-CMP-010 FR-CMP-011 FR-CMP-014
