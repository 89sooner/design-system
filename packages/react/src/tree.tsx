"use client";
// FR-CMP-018 · CR-078: a hierarchy of items (WAI-ARIA tree view). Radix has no tree, so Headless Tree owns
// the roles, `aria-level`/`aria-setsize`/`aria-posinset`/`aria-expanded`, the roving tab stop, the arrow
// keys and Home/End (the ADR-004 exception CR-078 records, as react-day-picker and downshift
// are for DatePicker and CommandPalette). This file maps nodes to that model and paints the rows.
// CR-080: type-ahead is a Headless Tree hotkey too; Conductor only decides which row the typed text names.
import { createTree, hotkeysCoreFeature, syncDataLoaderFeature, type ItemInstance, type TreeConfig, type TreeInstance, type TreeState } from "@headless-tree/core";
import { forwardRef, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx";

export interface TreeNode {
  readonly id: string;
  /** The row's accessible name and the text type-ahead searches. */
  readonly label: string;
  /** A decorative icon before the label. */
  readonly icon?: ReactNode;
  /** Present, even empty, makes the node a branch that expands. */
  readonly children?: readonly TreeNode[];
}

export interface TreeProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> {
  readonly items: readonly TreeNode[];
  /** Branches open on first render. */
  readonly defaultExpandedIds?: readonly string[];
  /** The selected node (controlled). */
  readonly selectedId?: string | null;
  readonly defaultSelectedId?: string | null;
  /** Click, Enter or Space on a row selects it. */
  readonly onSelectedIdChange?: (id: string) => void;
}

const ROOT = "cdt-tree-root";
/** Keys typed closer together than this extend one type-ahead query. */
const TYPEAHEAD_RESET_MS = 500;

/**
 * WAI-ARIA tree type-ahead: the index of the next visible row whose name starts with `query`, wrapping past
 * the end, or -1. One character, or the same character repeated, steps past the focused row so repeated
 * presses cycle; a longer query may stay on the focused row while it still matches.
 */
export function findTypeaheadMatch(names: readonly string[], focused: number, query: string): number {
  const repeated = [...query].every((character) => character === query[0]);
  const needle = (repeated ? query.slice(0, 1) : query).toLocaleLowerCase();
  const start = repeated ? focused + 1 : focused;
  for (let offset = 0; offset < names.length; offset += 1) {
    const index = (start + offset + names.length) % names.length;
    if (names[index]!.toLocaleLowerCase().startsWith(needle)) return index;
  }
  return -1;
}

function indexNodes(items: readonly TreeNode[]): Map<string, TreeNode> {
  const nodes = new Map<string, TreeNode>([[ROOT, { id: ROOT, label: "", children: items }]]);
  const visit = (list: readonly TreeNode[]): void => {
    for (const node of list) {
      nodes.set(node.id, node);
      if (node.children !== undefined) visit(node.children);
    }
  };
  visit(items);
  return nodes;
}

/**
 * Headless Tree's own `useTree` builds the visible rows in an effect, so the server would render an empty
 * tree. Scheduling the rebuild instead makes the first `getItems()` build them synchronously, on the server
 * and in the first client render alike.
 */
function useTreeModel(config: TreeConfig<TreeNode>): TreeInstance<TreeNode> {
  const [tree] = useState(() => {
    const instance = createTree(config);
    instance.scheduleRebuildTree();
    return instance;
  });
  const [state, setState] = useState<Partial<TreeState<TreeNode>>>(() => tree.getState());
  tree.setConfig((previous) => ({ ...previous, ...config, state: { ...state, ...config.state }, setState }));
  useEffect(() => {
    // Mounting flushes the state updates Headless Tree queues until the tree is attached, as its `useTree` does.
    const mountable = tree as unknown as { setMounted(mounted: boolean): void };
    mountable.setMounted(true);
    return () => mountable.setMounted(false);
  }, [tree]);
  return tree;
}

export const Tree = forwardRef<HTMLDivElement, TreeProps>(function Tree({ "aria-label": ariaLabel, className, defaultExpandedIds = [], defaultSelectedId = null, items, onSelectedIdChange, selectedId, ...props }, ref) {
  const nodes = indexNodes(items);
  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultSelectedId);
  const selected = selectedId === undefined ? uncontrolled : selectedId;
  const typed = useRef({ query: "", at: Number.NEGATIVE_INFINITY });
  const select = (item: ItemInstance<TreeNode>): void => {
    const id = item.getId();
    if (selectedId === undefined) setUncontrolled(id);
    onSelectedIdChange?.(id);
  };
  const tree = useTreeModel({
    rootItemId: ROOT,
    initialState: { expandedItems: [...defaultExpandedIds] },
    getItemName: (item) => item.getItemData().label,
    isItemFolder: (item) => item.getItemData().children !== undefined,
    dataLoader: {
      getItem: (id) => nodes.get(id) ?? { id, label: id },
      getChildren: (id) => (nodes.get(id)?.children ?? []).map((child) => child.id),
    },
    onPrimaryAction: select,
    // Enter and Space run the row's action, as the WAI-ARIA tree pattern asks; the library leaves them to us.
    hotkeys: {
      customActivate: { hotkey: "Enter", handler: (_event, model) => model.getFocusedItem().primaryAction() },
      customActivateSpace: { hotkey: "Space", handler: (_event, model) => model.getFocusedItem().primaryAction() },
      customTypeahead: {
        hotkey: "LetterOrNumber",
        preventDefault: true,
        handler: (event, model) => {
          // A key that composes text (IME) or names no single character is not type-ahead.
          if (event.isComposing || event.key.length !== 1) return;
          const now = event.timeStamp;
          const query = (now - typed.current.at < TYPEAHEAD_RESET_MS ? typed.current.query : "") + event.key;
          typed.current = { query, at: now };
          const rows = model.getItems();
          const index = findTypeaheadMatch(rows.map((row) => row.getItemName()), model.getFocusedItem().getItemMeta().index, query);
          if (index < 0) return;
          rows[index]!.setFocused();
          model.updateDomFocus();
        },
      },
    },
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  });
  const container = tree.getContainerProps(ariaLabel);
  return (
    <div
      {...props}
      {...container}
      aria-label={ariaLabel}
      ref={(element: HTMLDivElement | null) => {
        (container.ref as (element: HTMLDivElement | null) => void)(element);
        if (typeof ref === "function") ref(element);
        else if (ref !== null) ref.current = element;
      }}
      className={cx("cdt-tree", className)}
    >
      {tree.getItems().map((item) => {
        const node = item.getItemData();
        const level = item.getItemMeta().level;
        const isSelected = item.getId() === selected;
        return (
          <div
            {...item.getProps()}
            key={item.getKey()}
            aria-selected={isSelected}
            data-state={item.isFolder() ? (item.isExpanded() ? "open" : "closed") : undefined}
            data-selected={isSelected ? "" : undefined}
            className="cdt-tree__item"
            style={{ "--cdt-tree-level": level } as CSSProperties}
          >
            <span className="cdt-tree__chevron" aria-hidden="true">{item.isFolder() ? "▸" : null}</span>
            {node.icon === undefined ? null : <span className="cdt-tree__icon" aria-hidden="true">{node.icon}</span>}
            <span className="cdt-tree__label">{node.label}</span>
          </div>
        );
      })}
    </div>
  );
});
Tree.displayName = "Tree";
