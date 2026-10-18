// FR-CMP-010 ~ FR-CMP-012 · CR-053
//
// Every string the CR-041 components render themselves, so a consumer can supply its own language.
// Each component takes `labels?: Partial<…Labels>` and merges it over these English defaults; a
// string that interpolates (a count, a row name) is a function. Strings the consumer already passes
// in as props (`label`, `removeLabel`, `stateMessage`) are not repeated here.

export interface ComboboxLabels {
  readonly loading: string;
  readonly error: string;
  readonly empty: string;
}
export const DEFAULT_COMBOBOX_LABELS: ComboboxLabels = { loading: "Loading options", error: "Couldn't load options", empty: "No options" };

export interface MultiSelectLabels {
  readonly search: string;
  readonly searchFor: (label: string) => string;
  readonly remove: (option: string) => string;
}
export const DEFAULT_MULTI_SELECT_LABELS: MultiSelectLabels = { search: "Find options", searchFor: (label) => `Find ${label} options`, remove: (option) => `Remove ${option}` };

export interface DataTableLabels {
  readonly error: string;
  readonly partial: string;
  readonly previewColumn: string;
  readonly select: string;
  readonly preview: (row: string) => string;
  readonly loading: string;
  readonly failed: string;
  readonly empty: string;
  readonly loaded: (count: number) => string;
  readonly loadMore: string;
}
export const DEFAULT_DATA_TABLE_LABELS: DataTableLabels = {
  error: "Couldn't load results",
  partial: "Showing partial results",
  previewColumn: "Preview",
  select: "Select",
  preview: (row) => `Preview ${row}`,
  loading: "Loading results",
  failed: "Lookup failed",
  empty: "No results",
  loaded: (count) => `${count} loaded`,
  loadMore: "Load more",
};

export interface WorkbenchLayoutLabels { readonly resize: string }
export const DEFAULT_WORKBENCH_LAYOUT_LABELS: WorkbenchLayoutLabels = { resize: "Preview width" };

export interface DetailInspectorLabels { readonly close: string }
export const DEFAULT_DETAIL_INSPECTOR_LABELS: DetailInspectorLabels = { close: "Close preview" };

export interface PathListLabels { readonly loading: string; readonly error: string }
export const DEFAULT_PATH_LIST_LABELS: PathListLabels = { loading: "Loading path", error: "Couldn't load path" };

export interface CopyButtonLabels { readonly copied: string; readonly unavailable: string; readonly failed: string }
export const DEFAULT_COPY_BUTTON_LABELS: CopyButtonLabels = { copied: "Copied", unavailable: "Copy unavailable · select the text to copy it", failed: "Copy failed · select the text to copy it" };

export interface ProcessingStatusLabels { readonly complete: string; readonly pending: string; readonly delayed: string; readonly failed: string; readonly unknown: string }
export const DEFAULT_PROCESSING_STATUS_LABELS: ProcessingStatusLabels = { complete: "Confirmed", pending: "Pending", delayed: "Delayed", failed: "Failed", unknown: "Unknown" };

export interface RelationGraphLabels {
  readonly retracted: string;
  readonly unresolved: string;
  readonly ambiguous: string;
  readonly confirmed: string;
  readonly missingEndpoint: string;
  readonly findNode: string;
  readonly findPlaceholder: string;
  readonly relationType: string;
  readonly allTypes: string;
  readonly skipToList: string;
  readonly legend: string;
  readonly summary: (nodes: number, edges: number) => string;
  readonly loading: string;
  readonly empty: string;
  readonly error: string;
  readonly partial: string;
  readonly retry: string;
  readonly viewControls: string;
  readonly zoomIn: string;
  readonly zoomOut: string;
  readonly fit: string;
  readonly panLeft: string;
  readonly panRight: string;
  readonly panUp: string;
  readonly panDown: string;
  readonly zoomLevel: string;
  readonly detail: string;
  readonly noDescription: string;
  readonly unavailableContent: string;
  readonly neighborsHighlighted: string;
  readonly type: string;
  readonly state: string;
  readonly confidence: string;
  readonly unknownConfidence: string;
  readonly evidence: string;
  readonly noEvidence: string;
  readonly hiddenByFilter: string;
  readonly selectionMissing: string;
  readonly selectionHint: string;
  readonly clearSelection: string;
  readonly alternativeList: string;
  readonly nodeList: (count: number) => string;
  readonly nodeUnavailable: string;
  readonly noMatches: string;
  readonly edgeTable: (label: string) => string;
  readonly directionColumn: string;
  readonly typeStateColumn: string;
  readonly confidenceEvidenceColumn: string;
  readonly selectColumn: string;
  readonly endpointMissing: string;
  readonly evidenceMissing: string;
  readonly selectEdge: (id: string) => string;
  readonly showEvidence: string;
  readonly noneForFilter: string;
}
export const DEFAULT_RELATION_GRAPH_LABELS: RelationGraphLabels = {
  retracted: "Retracted",
  unresolved: "Unresolved",
  ambiguous: "Ambiguous",
  confirmed: "Confirmed",
  missingEndpoint: "No details for this endpoint",
  findNode: "Find node",
  findPlaceholder: "Name or stable ID",
  relationType: "Relation type",
  allTypes: "All types",
  skipToList: "Skip to the equivalent list",
  legend: "Arrows read source → relation → target. Solid: confirmed · dotted: unresolved or ambiguous · dashed: retracted. Position follows ID order and does not imply time, merge or dependency order.",
  summary: (nodes, edges) => `${nodes} nodes · ${edges} relations`,
  loading: "Loading relations",
  empty: "No confirmed relations",
  error: "Couldn't load relations",
  partial: "Partial result: some relations may be missing",
  retry: "Retry relations",
  viewControls: "Graph view controls",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  fit: "Fit all",
  panLeft: "Pan graph left",
  panRight: "Pan graph right",
  panUp: "Pan graph up",
  panDown: "Pan graph down",
  zoomLevel: "Zoom level",
  detail: "Selected relation details",
  noDescription: "No description",
  unavailableContent: "This item's content can't be shown.",
  neighborsHighlighted: "Connected neighbours are highlighted.",
  type: "Type",
  state: "State",
  confidence: "Confidence",
  unknownConfidence: "Unknown",
  evidence: "Evidence",
  noEvidence: "Not provided",
  hiddenByFilter: "The selected relation is hidden by the current type filter.",
  selectionMissing: "The selected item is no longer in the data.",
  selectionHint: "Select a node or relation to see its direction, state and evidence.",
  clearSelection: "Clear selection",
  alternativeList: "Relation list alternative",
  nodeList: (count) => `Nodes · ${count} (including isolated nodes)`,
  nodeUnavailable: "content unavailable",
  noMatches: "No matching nodes",
  edgeTable: (label) => `${label} — direction and evidence`,
  directionColumn: "Source → relation → target",
  typeStateColumn: "Type · state",
  confidenceEvidenceColumn: "Confidence · evidence",
  selectColumn: "Select",
  endpointMissing: "endpoint details missing",
  evidenceMissing: "no evidence provided",
  selectEdge: (id) => `Select relation: ${id}`,
  showEvidence: "Show evidence",
  noneForFilter: "No relations to show for the current filter.",
};

/* CR-054 components (FR-CMP-014). Same rule: English defaults, overridable per instance. */

export interface ToastLabels { readonly close: string }
export const DEFAULT_TOAST_LABELS: ToastLabels = { close: "Dismiss notification" };

export interface DatePickerLabels {
  readonly placeholder: string;
  readonly dialog: string;
}
export const DEFAULT_DATE_PICKER_LABELS: DatePickerLabels = { placeholder: "Pick a date", dialog: "Choose a date" };

export interface CommandPaletteLabels {
  readonly title: string;
  readonly input: string;
  readonly placeholder: string;
  readonly empty: string;
  readonly results: (count: number) => string;
}
export const DEFAULT_COMMAND_PALETTE_LABELS: CommandPaletteLabels = {
  title: "Command palette",
  input: "Search commands",
  placeholder: "Type a command or search",
  empty: "No matching commands",
  results: (count) => (count === 1 ? "1 command" : `${count} commands`),
};

export interface PaginationLabels {
  readonly nav: string;
  readonly previous: string;
  readonly next: string;
  readonly page: (page: number) => string;
}
export const DEFAULT_PAGINATION_LABELS: PaginationLabels = { nav: "Pagination", previous: "Previous", next: "Next", page: (page) => `Page ${page}` };

/* CR-060 components (FR-CMP-015). Same rule: English defaults, overridable per instance. */

export interface NumberInputLabels {
  readonly increment: string;
  readonly decrement: string;
}
export const DEFAULT_NUMBER_INPUT_LABELS: NumberInputLabels = { increment: "Increase", decrement: "Decrease" };

/* CR-061 agent interface components (FR-CMP-016). English defaults, overridable per instance. */

export interface ConversationLabels {
  readonly log: string;
  readonly scrollToLatest: string;
}
export const DEFAULT_CONVERSATION_LABELS: ConversationLabels = { log: "Conversation", scrollToLatest: "Scroll to latest message" };

export interface MessageLabels {
  readonly user: string;
  readonly assistant: string;
  readonly system: string;
  readonly streaming: string;
  readonly error: string;
}
export const DEFAULT_MESSAGE_LABELS: MessageLabels = { user: "You", assistant: "Assistant", system: "System", streaming: "Responding", error: "The response failed." };

export interface PromptInputLabels {
  readonly input: string;
  readonly submit: string;
  readonly stop: string;
}
export const DEFAULT_PROMPT_INPUT_LABELS: PromptInputLabels = { input: "Message", submit: "Send", stop: "Stop" };

export interface ReasoningLabels {
  readonly thinking: string;
  readonly thought: (seconds: number | undefined) => string;
}
export const DEFAULT_REASONING_LABELS: ReasoningLabels = {
  thinking: "Thinking…",
  thought: (seconds) => (seconds === undefined ? "Thought for a few seconds" : seconds === 1 ? "Thought for 1 second" : `Thought for ${seconds} seconds`),
};

export interface ToolLabels {
  readonly parameters: string;
  readonly result: string;
  readonly error: string;
  readonly status: Readonly<Record<"pending" | "running" | "awaiting-approval" | "completed" | "error", string>>;
}
export const DEFAULT_TOOL_LABELS: ToolLabels = {
  parameters: "Parameters",
  result: "Result",
  error: "Error",
  status: { pending: "Pending", running: "Running", "awaiting-approval": "Awaiting approval", completed: "Completed", error: "Error" },
};

export interface ConfirmationLabels {
  readonly approve: string;
  readonly reject: string;
  readonly approved: string;
  readonly rejected: string;
}
export const DEFAULT_CONFIRMATION_LABELS: ConfirmationLabels = { approve: "Approve", reject: "Reject", approved: "Approved", rejected: "Rejected" };

export interface SourcesLabels {
  readonly summary: (count: number) => string;
}
export const DEFAULT_SOURCES_LABELS: SourcesLabels = { summary: (count) => (count === 1 ? "Used 1 source" : `Used ${count} sources`) };

export interface InlineCitationLabels {
  readonly citation: (index: number, title: string) => string;
}
export const DEFAULT_INLINE_CITATION_LABELS: InlineCitationLabels = { citation: (index, title) => `Source ${index}: ${title}` };

export interface SuggestionsLabels {
  readonly group: string;
}
export const DEFAULT_SUGGESTIONS_LABELS: SuggestionsLabels = { group: "Suggestions" };
