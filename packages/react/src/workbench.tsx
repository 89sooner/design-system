"use client";
// FR-CMP-010, FR-CMP-012 · WP-030, WP-032
import { forwardRef, useEffect, useId, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode, type Ref } from "react";
import { useCombobox } from "downshift";
import { Button } from "./action";
import { Checkbox, TextField } from "./form";
import { Table, Timeline } from "./data";
import { Banner, EmptyState } from "./feedback";
import { Badge } from "./status";
import { cx } from "./cx";
import { DEFAULT_COMBOBOX_LABELS, DEFAULT_COPY_BUTTON_LABELS, DEFAULT_DATA_TABLE_LABELS, DEFAULT_DETAIL_INSPECTOR_LABELS, DEFAULT_MULTI_SELECT_LABELS, DEFAULT_PATH_LIST_LABELS, DEFAULT_PROCESSING_STATUS_LABELS, DEFAULT_WORKBENCH_LAYOUT_LABELS, type ComboboxLabels, type CopyButtonLabels, type DataTableLabels, type DetailInspectorLabels, type MultiSelectLabels, type PathListLabels, type ProcessingStatusLabels, type WorkbenchLayoutLabels } from "./labels";

export interface SearchOption { readonly id: string; readonly label: string; readonly disabled?: boolean }
export interface ComboboxProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  readonly label: string;
  readonly options: readonly SearchOption[];
  readonly value: string | null;
  readonly query: string;
  readonly onQueryChange: (query: string) => void;
  readonly onValueChange: (id: string | null) => void;
  readonly state?: "ready" | "loading" | "error";
  /** Results must belong to the current query; stale batches are hidden. */
  readonly resultsQuery?: string;
  readonly disabled?: boolean;
  readonly inputRef?: Ref<HTMLInputElement>;
  /** Status strings, merged over English defaults (CR-053). */
  readonly labels?: Partial<ComboboxLabels>;
}
export const Combobox = /* @__PURE__ */ forwardRef<HTMLDivElement, ComboboxProps>(function Combobox({ label, options, value, query, onQueryChange, onValueChange, state = "ready", resultsQuery = query, disabled, inputRef, labels, className, ...props }, ref) {
  const t = { ...DEFAULT_COMBOBOX_LABELS, ...labels };
  const uid = useId();
  const composing = useRef(false);
  const items = !disabled && state === "ready" && resultsQuery === query ? [...options] : [];
  const combo = useCombobox<SearchOption>({
    id: uid, items, inputValue: query,
    selectedItem: options.find(item => item.id === value) ?? null,
    itemToString: item => item?.label ?? "",
    isItemDisabled: item => !!item.disabled,
    onInputValueChange: changes => { if (changes.type === useCombobox.stateChangeTypes.InputChange) onQueryChange(changes.inputValue); },
    onSelectedItemChange: changes => onValueChange(changes.selectedItem?.id ?? null),
  });
  return <div {...props} ref={ref} className={cx("cdt-combobox", className)}>
    <label {...combo.getLabelProps()}>{label}</label>
    <TextField {...combo.getInputProps({ disabled, ref: inputRef, onCompositionStart: () => { composing.current = true; }, onCompositionEnd: () => { composing.current = false; }, onKeyDown: event => {
      if (composing.current || event.nativeEvent.isComposing || event.keyCode === 229) {
        (event as typeof event & { nativeEvent: KeyboardEvent & { preventDownshiftDefault?: boolean } }).nativeEvent.preventDownshiftDefault = true;
        (event as typeof event & { preventDownshiftDefault?: boolean }).preventDownshiftDefault = true;
        if (event.key === "Enter") event.preventDefault();
      }
    } })} />
    <ul {...combo.getMenuProps()} className="cdt-combobox__options" hidden={!combo.isOpen || disabled}>
      {combo.isOpen && items.map((item, index) => <li {...combo.getItemProps({ item, index })} key={item.id} data-highlighted={combo.highlightedIndex === index || undefined}>{item.label}</li>)}
    </ul>
    <span role="status">{state === "loading" || resultsQuery !== query ? t.loading : state === "error" ? t.error : combo.isOpen && items.length === 0 ? t.empty : ""}</span>
  </div>;
});

export interface FilterChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> { readonly children: ReactNode; readonly onRemove: () => void; readonly removeLabel: string; readonly disabled?: boolean }
export const FilterChip = /* @__PURE__ */ forwardRef<HTMLSpanElement, FilterChipProps>(function FilterChip({ children, onRemove, removeLabel, disabled, className, ...props }, ref) {
  return <span {...props} ref={ref} className={cx("cdt-filter-chip", className)}>{children}<Button size="sm" variant="ghost" aria-label={removeLabel} disabled={disabled} onClick={onRemove}>×</Button></span>;
});
export interface MultiSelectProps extends HTMLAttributes<HTMLFieldSetElement> { readonly label: string; readonly options: readonly SearchOption[]; readonly value: readonly string[]; readonly onValueChange: (ids: readonly string[]) => void; readonly disabled?: boolean; readonly labels?: Partial<MultiSelectLabels> }
export const MultiSelect = /* @__PURE__ */ forwardRef<HTMLFieldSetElement, MultiSelectProps>(function MultiSelect({ label, options, value, onValueChange, disabled, labels, className, ...props }, ref) {
  const t = { ...DEFAULT_MULTI_SELECT_LABELS, ...labels };
  const [query, setQuery] = useState("");
  const searchId = useId();
  return <fieldset {...props} ref={ref} disabled={disabled} className={cx("cdt-multi-select", className)}><legend>{label}</legend>
    <label htmlFor={searchId}>{t.search}</label><TextField id={searchId} aria-label={t.searchFor(label)} value={query} disabled={disabled} onChange={event => setQuery(event.target.value)} />
    <div className="cdt-filter-toolbar">{options.filter(option => value.includes(option.id)).map(option => <FilterChip key={option.id} disabled={disabled || option.disabled} removeLabel={t.remove(option.label)} onRemove={() => onValueChange(value.filter(id => id !== option.id))}>{option.label}</FilterChip>)}</div>
    <ul>{options.filter(option => option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(option => <li key={option.id}><label><Checkbox disabled={disabled || option.disabled} checked={value.includes(option.id)} onCheckedChange={checked => onValueChange(checked ? [...value, option.id] : value.filter(id => id !== option.id))} />{option.label}</label></li>)}</ul>
  </fieldset>;
});
export const FilterToolbar = /* @__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function FilterToolbar({ className, ...props }, ref) { return <div {...props} ref={ref} className={cx("cdt-filter-toolbar", className)} />; });

export interface DataColumn<Row> {
  readonly id: string; readonly header: string; readonly cell: (row: Row) => ReactNode; readonly sortable?: boolean; readonly numeric?: boolean;
  /** CSS length the column never shrinks below (CR-064). Narrower tables scroll inside themselves instead of breaking a badge. */
  readonly minInlineSize?: string;
}
export interface DataSort { readonly column: string; readonly direction: "ascending" | "descending" }
export interface DataTableProps<Row> extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  readonly label: string; readonly rows: readonly Row[]; readonly columns: readonly DataColumn<Row>[];
  readonly rowId: (row: Row) => string; readonly rowLabel: (row: Row) => string;
  readonly selectedId?: string | null; readonly onSelect?: (id: string, trigger: HTMLButtonElement) => void;
  /** Parent sorts the full source or requests server ordering; this component never sorts. */
  readonly sort?: DataSort; readonly onSortChange?: (sort: DataSort) => void;
  readonly visibleColumns?: readonly string[]; readonly density?: "comfortable" | "compact";
  readonly state?: "ready" | "loading" | "error" | "partial"; readonly message?: string;
  /** Next step shown in the error/partial banner, such as a retry button (CR-064). */
  readonly stateAction?: ReactNode;
  readonly hasMore?: boolean; readonly onLoadMore?: () => void; readonly loadingMore?: boolean;
  readonly labels?: Partial<DataTableLabels>;
}
function DataTableRoot<Row>({ label, rows, columns, rowId, rowLabel, selectedId, onSelect, sort, onSortChange, visibleColumns, density = "comfortable", state = "ready", message, stateAction, hasMore, onLoadMore, loadingMore, labels, className, ...props }: DataTableProps<Row>, ref: Ref<HTMLDivElement>) {
  const t = { ...DEFAULT_DATA_TABLE_LABELS, ...labels };
  const shown = columns.filter(column => visibleColumns === undefined || visibleColumns.includes(column.id));
  return <div {...props} ref={ref} className={cx("cdt-data-table", className)} data-density={density} aria-busy={state === "loading" || loadingMore || undefined}>
    {state === "error" || state === "partial" ? <Banner tone="warning" action={stateAction}>{message ?? (state === "error" ? t.error : t.partial)}</Banner> : null}
    <Table caption={label}><Table.Head><Table.Row>{onSelect && <Table.HeaderCell>{t.previewColumn}</Table.HeaderCell>}{shown.map(column => <Table.HeaderCell key={column.id} aria-sort={sort?.column === column.id ? sort.direction : undefined} style={column.minInlineSize === undefined ? undefined : { minInlineSize: column.minInlineSize }}>{column.sortable && onSortChange ? <Button variant="ghost" size="sm" onClick={() => onSortChange({ column: column.id, direction: sort?.column === column.id && sort.direction === "ascending" ? "descending" : "ascending" })}>{column.header}{sort?.column === column.id ? sort.direction === "ascending" ? " ↑" : " ↓" : " ↕"}</Button> : column.header}</Table.HeaderCell>)}</Table.Row></Table.Head>
    <Table.Body>{state !== "loading" && rows.map(row => <Table.Row key={rowId(row)} data-row-id={rowId(row)} data-selected={selectedId === rowId(row) || undefined}>{onSelect && <Table.Cell><Button size="sm" variant="ghost" aria-label={t.preview(rowLabel(row))} aria-pressed={selectedId === rowId(row)} onClick={event => onSelect(rowId(row), event.currentTarget)}>{t.select}</Button></Table.Cell>}{shown.map(column => <Table.Cell key={column.id} numeric={column.numeric}>{column.cell(row)}</Table.Cell>)}</Table.Row>)}{(state === "loading" || rows.length === 0) && <Table.Row><Table.Cell colSpan={shown.length + (onSelect ? 1 : 0)}>{state === "loading" ? <Skeleton label={t.loading} /> : <EmptyState title={state === "error" ? t.failed : t.empty} />}</Table.Cell></Table.Row>}</Table.Body></Table>
    <div className="cdt-filter-toolbar"><span role="status">{t.loaded(state === "loading" ? 0 : rows.length)}</span>{hasMore && onLoadMore ? <Button onClick={onLoadMore} loading={loadingMore} disabled={state === "loading"}>{t.loadMore}</Button> : null}</div>
  </div>;
}
export const DataTable = /* @__PURE__ */ forwardRef(DataTableRoot) as <Row>(props: DataTableProps<Row> & { readonly ref?: Ref<HTMLDivElement> }) => ReactNode;

export interface WorkbenchLayoutProps extends HTMLAttributes<HTMLDivElement> { readonly inspector?: ReactNode; readonly width?: number; readonly onWidthChange?: (width: number) => void; readonly labels?: Partial<WorkbenchLayoutLabels> }
export const WorkbenchLayout = /* @__PURE__ */ forwardRef<HTMLDivElement, WorkbenchLayoutProps>(function WorkbenchLayout({ inspector, width = 40, onWidthChange, labels, children, className, style, ...props }, ref) {
  const t = { ...DEFAULT_WORKBENCH_LAYOUT_LABELS, ...labels };
  return <div {...props} ref={ref} style={{ ...style, "--cdt-workbench-inspector-share": `${Math.max(25, Math.min(60, width))}%` } as CSSProperties} className={cx("cdt-workbench", className)} data-inspecting={!!inspector || undefined}><div className="cdt-workbench__results">{children}</div>{inspector && <div className="cdt-workbench__inspector">{onWidthChange && <label className="cdt-workbench__resize">{t.resize} <input type="range" min={25} max={60} value={width} onChange={event => onWidthChange(Number(event.target.value))} /></label>}{inspector}</div>}</div>;
});
export interface DetailInspectorProps extends HTMLAttributes<HTMLElement> { readonly label: string; readonly onClose: () => void; readonly returnFocusRef?: { readonly current: HTMLElement | null }; readonly labels?: Partial<DetailInspectorLabels> }
export const DetailInspector = /* @__PURE__ */ forwardRef<HTMLElement, DetailInspectorProps>(function DetailInspector({ label, onClose, returnFocusRef, labels, className, children, onKeyDown, ...props }, ref) {
  const t = { ...DEFAULT_DETAIL_INSPECTOR_LABELS, ...labels };
  const close = () => { onClose(); returnFocusRef?.current?.focus({ preventScroll: true }); };
  return <section {...props} ref={ref} aria-label={props["aria-label"] ?? label} className={cx("cdt-detail-inspector", className)} onKeyDown={event => { onKeyDown?.(event); if (!event.defaultPrevented && event.key === "Escape") { event.preventDefault(); close(); } }}><header><h2>{label}</h2><Button variant="ghost" size="sm" onClick={close}>{t.close}</Button></header>{children}</section>;
});
export const Skeleton = /* @__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { readonly label: string }>(function Skeleton({ label, className, ...props }, ref) { return <div {...props} ref={ref} role="status" className={cx("cdt-skeleton", className)}>{label}</div>; });
export const Breadcrumb = /* @__PURE__ */ forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Breadcrumb({ className, "aria-label": label = "Breadcrumb", ...props }, ref) { return <nav {...props} ref={ref} aria-label={label} className={cx("cdt-breadcrumb", className)} />; });
export interface PathItem { readonly id: string; readonly label: string; readonly children?: readonly PathItem[]; readonly state?: "loading" | "error"; }
export interface PathListProps extends HTMLAttributes<HTMLUListElement> { readonly items: readonly PathItem[]; readonly selectedId?: string; readonly onPathSelect?: (id: string) => void; readonly labels?: Partial<PathListLabels> }
export const PathList = /* @__PURE__ */ forwardRef<HTMLUListElement, PathListProps>(function PathListRoot({ items, selectedId, onPathSelect, labels, className, ...props }, ref) {
  const t = { ...DEFAULT_PATH_LIST_LABELS, ...labels };
  return <ul {...props} ref={ref} className={cx("cdt-path-list", className)}>{items.map(item => <li key={item.id}>{item.children !== undefined ? <details><summary>{item.label}</summary><PathList items={item.children} selectedId={selectedId} onPathSelect={onPathSelect} labels={labels} /></details> : <Button variant="ghost" size="sm" aria-pressed={selectedId === item.id} onClick={() => onPathSelect?.(item.id)} disabled={!onPathSelect}>{item.label}</Button>}{item.state && <span role="status">{item.state === "loading" ? t.loading : t.error}</span>}</li>)}</ul>;
});
export interface CopyButtonProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> { readonly value: string; readonly label?: string; readonly labels?: Partial<CopyButtonLabels> }
export const CopyButton = /* @__PURE__ */ forwardRef<HTMLSpanElement, CopyButtonProps>(function CopyButton({ value, label = "Copy", labels, className, ...props }, ref) {
  const t = { ...DEFAULT_COPY_BUTTON_LABELS, ...labels };
  const [result, setResult] = useState<{ value: string; text: string } | null>(null);
  const generation = useRef(0);
  useEffect(() => { ++generation.current; setResult(null); return () => { ++generation.current; }; }, [value]);
  return <span {...props} ref={ref} className={cx("cdt-copy-feedback", className)}><Button size="sm" variant="ghost" onClick={() => {
    const mine = ++generation.current;
    const write = typeof navigator !== "undefined" ? navigator.clipboard?.writeText(value) : undefined;
    if (!write) { setResult({ value, text: t.unavailable }); return; }
    void write.then(() => { if (mine === generation.current) setResult({ value, text: t.copied }); }, () => { if (mine === generation.current) setResult({ value, text: t.failed }); });
  }}>{label}</Button><span role="status">{result?.value === value ? result.text : ""}</span></span>;
});

export interface ProcessingStage { readonly id: string; readonly label: string; readonly status: "complete" | "pending" | "delayed" | "failed" | "unknown"; readonly detail: string; readonly action?: { readonly label: string; readonly onAction: () => void; readonly disabledReason?: string; readonly busy?: boolean } }
export interface ProcessingStatusProps extends HTMLAttributes<HTMLDivElement> { readonly stages: readonly ProcessingStage[]; readonly label: string; readonly labels?: Partial<ProcessingStatusLabels> }
export const ProcessingStatus = /* @__PURE__ */ forwardRef<HTMLDivElement, ProcessingStatusProps>(function ProcessingStatus({ stages, label, labels, className, ...props }, ref) {
  const t = { ...DEFAULT_PROCESSING_STATUS_LABELS, ...labels };
  return <div {...props} ref={ref} className={cx("cdt-processing-status", className)}><Timeline aria-label={label}>{stages.map(stage => <Timeline.Step key={stage.id}><div className="cdt-filter-toolbar"><strong>{stage.label}</strong><Badge>{t[stage.status]}</Badge></div><p>{stage.detail}</p>{stage.action && <><Button loading={stage.action.busy} blockedReason={stage.action.disabledReason} onClick={stage.action.onAction}>{stage.action.label}</Button>{stage.action.disabledReason && <p>{stage.action.disabledReason}</p>}</>}</Timeline.Step>)}</Timeline></div>;
});
