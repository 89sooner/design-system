"use client";
// FR-CMP-014 · CR-054: a command palette. The modal (focus trap, Escape, return focus) is Radix
// Dialog; the input-plus-listbox keyboard model (arrows, Home/End, Enter, active descendant) is
// downshift's combobox, the same engine `Combobox` uses (ADR-004). Opening it with a shortcut is the
// consumer's call: the palette does not bind a global key.
import * as RadixDialog from "@radix-ui/react-dialog";
import { useCombobox } from "downshift";
import { forwardRef, useId, useMemo, useRef, useState, type HTMLAttributes } from "react";
import { cx } from "./cx";
import { Kbd } from "./data";
import { DEFAULT_COMMAND_PALETTE_LABELS, type CommandPaletteLabels } from "./labels";

export interface Command {
  readonly id: string;
  readonly label: string;
  readonly group?: string;
  /** Extra words the query matches, such as synonyms. Never shown. */
  readonly keywords?: readonly string[];
  /** Keys shown as `Kbd` chips, for example `["⌘", "K"]`. Display only; the palette binds nothing. */
  readonly shortcut?: readonly string[];
  readonly disabled?: boolean;
}

/** Every whitespace-separated term of `query` must appear in the label, group or a keyword (case-insensitive). Order is kept. */
export function filterCommands(commands: readonly Command[], query: string): readonly Command[] {
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return commands;
  return commands.filter((command) => {
    const haystack = [command.label, command.group ?? "", ...(command.keywords ?? [])].join(" ").toLocaleLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

/** Consecutive commands that share a group, with the flat index of each run's first member. */
function groupRuns(items: readonly Command[]): readonly { readonly group: string | undefined; readonly start: number; readonly members: readonly Command[] }[] {
  return items.reduce<{ group: string | undefined; start: number; members: Command[] }[]>((runs, item, index) => {
    const last = runs[runs.length - 1];
    if (last !== undefined && last.group === item.group) last.members.push(item);
    else runs.push({ group: item.group, start: index, members: [item] });
    return runs;
  }, []);
}

export interface CommandPaletteProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly commands: readonly Command[];
  /** Called with the chosen command's id; the palette then closes. */
  readonly onSelect: (id: string) => void;
  readonly labels?: Partial<CommandPaletteLabels>;
}

/** The combobox lives only while the dialog is open, so downshift never sees an unmounted input. */
function CommandPaletteBody({ commands, onChoose, t }: { readonly commands: readonly Command[]; readonly onChoose: (id: string) => void; readonly t: CommandPaletteLabels }) {
  const [query, setQuery] = useState("");
  const uid = useId();
  const items = useMemo(() => filterCommands(commands, query), [commands, query]);
  const combo = useCombobox<Command>({
    items: [...items],
    inputValue: query,
    isOpen: true,
    selectedItem: null,
    defaultHighlightedIndex: 0,
    itemToString: (item) => item?.label ?? "",
    isItemDisabled: (item) => !!item.disabled,
    onInputValueChange: ({ inputValue }) => setQuery(inputValue),
    onSelectedItemChange: ({ selectedItem }) => { if (selectedItem) onChoose(selectedItem.id); },
    // Escape belongs to the dialog: downshift would only clear the input, so leave the event to Radix.
    stateReducer: (state, { type, changes }) => (type === useCombobox.stateChangeTypes.InputKeyDownEscape ? state : changes),
  });
  const groups = groupRuns(items);
  return <>
    <label {...combo.getLabelProps()} className="cdt-sr-only">{t.input}</label>
    <input {...combo.getInputProps()} className="cdt-input cdt-command__input" placeholder={t.placeholder} />
    <ul {...combo.getMenuProps()} className="cdt-command__list">
      {groups.map(({ group, start, members }, groupIndex) => {
        const options = members.map((item, offset) => {
          const index = start + offset;
          return <li {...combo.getItemProps({ item, index })} key={item.id} className="cdt-command__item" data-highlighted={combo.highlightedIndex === index || undefined} data-disabled={item.disabled || undefined}>
            <span>{item.label}</span>
            {item.shortcut === undefined ? null : <span className="cdt-command__shortcut" aria-hidden="true">{item.shortcut.map((key) => <Kbd key={key}>{key}</Kbd>)}</span>}
          </li>;
        });
        if (group === undefined) return options;
        const headingId = `${uid}-group-${groupIndex}`;
        return <li key={headingId} role="group" aria-labelledby={headingId} className="cdt-command__group">
          <div id={headingId} className="cdt-command__group-label" role="presentation">{group}</div>
          <ul role="presentation" className="cdt-command__group-list">{options}</ul>
        </li>;
      })}
    </ul>
    {items.length === 0 ? <p className="cdt-command__empty">{t.empty}</p> : null}
    <span role="status" className="cdt-sr-only">{items.length === 0 ? t.empty : t.results(items.length)}</span>
  </>;
}

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(function CommandPalette({ open, onOpenChange, commands, onSelect, labels, className, ...props }, ref) {
  const t = { ...DEFAULT_COMMAND_PALETTE_LABELS, ...labels };
  // Opened from a button or a shortcut there is no Dialog.Trigger to return to, so remember what had
  // focus. It is read while rendering the opening frame: the input takes focus before Radix's
  // onOpenAutoFocus would run, and an effect here would run after the children's.
  const returnTo = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  if (open && !wasOpen.current && typeof document !== "undefined") {
    const active = document.activeElement;
    returnTo.current = active instanceof HTMLElement ? active : null;
  }
  wasOpen.current = open;
  return <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="cdt-overlay" />
      <RadixDialog.Content
        {...props}
        ref={ref}
        aria-describedby={undefined}
        className={cx("cdt-dialog", "cdt-command", className)}
        onCloseAutoFocus={(event) => { if (returnTo.current?.isConnected) { event.preventDefault(); returnTo.current.focus(); } }}
      >
        <RadixDialog.Title className="cdt-command__title">{t.title}</RadixDialog.Title>
        <CommandPaletteBody commands={commands} t={t} onChoose={(id) => { onOpenChange(false); onSelect(id); }} />
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>;
});
CommandPalette.displayName = "CommandPalette";
