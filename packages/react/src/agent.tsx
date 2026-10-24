"use client";
// FR-CMP-016 · CR-061: building blocks for agent and chat interfaces, modelled on the parts Vercel
// AI Elements ships (2026-10) but built the Conductor way: CSS custom properties, no Tailwind, and
// Radix for every disclosure and popover (ADR-002, ADR-004). The props are plain data (role, text,
// status) rather than any SDK's message type, so a consumer maps its own records onto them.
import * as RadixCollapsible from "@radix-ui/react-collapsible";
import * as RadixPopover from "@radix-ui/react-popover";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FormEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { Button } from "./action";
import { cx } from "./cx";
import { CodeBlock } from "./data";
import { useRouteCloseAutoFocus } from "./route-focus";
import { Badge } from "./status";
import type { Tone } from "./types";
import {
  DEFAULT_CONFIRMATION_LABELS,
  DEFAULT_CONVERSATION_LABELS,
  DEFAULT_INLINE_CITATION_LABELS,
  DEFAULT_MESSAGE_LABELS,
  DEFAULT_PROMPT_INPUT_LABELS,
  DEFAULT_REASONING_LABELS,
  DEFAULT_SOURCES_LABELS,
  DEFAULT_SUGGESTIONS_LABELS,
  DEFAULT_TOOL_LABELS,
  type ConfirmationLabels,
  type ConversationLabels,
  type InlineCitationLabels,
  type MessageLabels,
  type PromptInputLabels,
  type ReasoningLabels,
  type SourcesLabels,
  type SuggestionsLabels,
  type ToolLabels,
} from "./labels";

/* Server rendering has no layout; `useLayoutEffect` would warn there. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref !== null && ref !== undefined) (ref as { current: T | null }).current = value;
}

/* ─── Shimmer ──────────────────────────────────────────────────────────────────────────────── */

export type ShimmerProps = HTMLAttributes<HTMLSpanElement>;

/** Text with a moving highlight, for "working" labels. Under reduced motion it is plain text. */
export const Shimmer = forwardRef<HTMLSpanElement, ShimmerProps>(function Shimmer({ className, ...props }, ref) {
  return <span {...props} ref={ref} className={cx("cdt-shimmer", className)} />;
});
Shimmer.displayName = "Shimmer";

/* ─── Conversation ─────────────────────────────────────────────────────────────────────────── */

export interface ConversationProps extends HTMLAttributes<HTMLDivElement> {
  readonly labels?: Partial<ConversationLabels>;
}

/** Distance from the bottom, in CSS pixels, still counted as "at the latest message". */
const STICK_THRESHOLD = 48;

/**
 * A scrolling message log. It stays pinned to the newest message while the reader is at the bottom,
 * stops following when they scroll up to read, and then offers a button back to the latest one.
 */
export const Conversation = forwardRef<HTMLDivElement, ConversationProps>(function Conversation({ children, className, labels, ...props }, ref) {
  const t = { ...DEFAULT_CONVERSATION_LABELS, ...labels };
  const viewport = useRef<HTMLDivElement | null>(null);
  const pinned = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const toBottom = useCallback(() => {
    const node = viewport.current;
    if (node !== null) node.scrollTop = node.scrollHeight;
  }, []);
  useIsomorphicLayoutEffect(() => {
    const node = viewport.current;
    if (node === null || typeof MutationObserver === "undefined") return;
    toBottom();
    const observer = new MutationObserver(() => { if (pinned.current) toBottom(); });
    observer.observe(node, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [toBottom]);
  const onScroll = (): void => {
    const node = viewport.current;
    if (node === null) return;
    const near = node.scrollHeight - node.scrollTop - node.clientHeight <= STICK_THRESHOLD;
    pinned.current = near;
    setAtBottom(near);
  };
  return (
    <div {...props} ref={ref} className={cx("cdt-conversation", className)}>
      <div ref={viewport} role="log" aria-label={t.log} tabIndex={0} className="cdt-conversation__viewport" onScroll={onScroll}>{children}</div>
      {atBottom ? null : <Button size="sm" className="cdt-conversation__latest" onClick={() => { pinned.current = true; setAtBottom(true); toBottom(); }}>{t.scrollToLatest}</Button>}
    </div>
  );
});
Conversation.displayName = "Conversation";

/* ─── Message ──────────────────────────────────────────────────────────────────────────────── */

/**
 * `user` is the person reading, at the end edge. `participant` is another person in a shared
 * conversation, at the start edge with the same bubble. `assistant` and `system` turns span the row.
 */
export type MessageRole = "user" | "participant" | "assistant" | "system";
export type MessageStatus = "complete" | "streaming" | "error";

export interface MessageProps extends HTMLAttributes<HTMLDivElement> {
  readonly from: MessageRole;
  /** The sender shown above the text. Defaults to the role label ("You", "Participant", "Assistant", "System"). */
  readonly name?: ReactNode;
  readonly avatar?: ReactNode;
  readonly status?: MessageStatus;
  /** Per-message actions (copy, retry, edit), shown after the text. */
  readonly actions?: ReactNode;
  readonly labels?: Partial<MessageLabels>;
}

export const Message = forwardRef<HTMLDivElement, MessageProps>(function Message({ actions, avatar, children, className, from, labels, name, status = "complete", ...props }, ref) {
  const t = { ...DEFAULT_MESSAGE_LABELS, ...labels };
  const nameId = useId();
  return (
    <div {...props} ref={ref} role="group" aria-labelledby={nameId} aria-busy={status === "streaming" || undefined} className={cx("cdt-message", `cdt-message--${from}`, status === "error" && "cdt-message--error", className)}>
      {avatar === undefined ? null : <div className="cdt-message__avatar">{avatar}</div>}
      <div className="cdt-message__body">
        <div id={nameId} className="cdt-message__author">{name ?? t[from]}{status === "streaming" ? <span className="cdt-sr-only">, {t.streaming}</span> : null}</div>
        <div className="cdt-message__content">{children}{status === "streaming" ? <span className="cdt-message__caret" aria-hidden="true" /> : null}</div>
        {status === "error" ? <p className="cdt-message__error" role="alert">{t.error}</p> : null}
        {actions === undefined ? null : <div className="cdt-message__actions">{actions}</div>}
      </div>
    </div>
  );
});
Message.displayName = "Message";

/* ─── PromptInput ──────────────────────────────────────────────────────────────────────────── */

export type PromptInputStatus = "ready" | "submitted" | "streaming" | "error";

export interface PromptInputProps extends Omit<ComponentPropsWithoutRef<"form">, "onSubmit" | "children"> {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  /** Called with the text when the person sends. Blank text never submits. */
  readonly onSubmit: (value: string) => void;
  /** While `submitted` or `streaming`, the send button becomes Stop and calls `onStop`. */
  readonly status?: PromptInputStatus;
  readonly onStop?: () => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  /** `enter`: Enter sends, Shift+Enter adds a line. `mod-enter`: ⌘/Ctrl+Enter sends, Enter adds a line. */
  readonly submitOn?: "enter" | "mod-enter";
  /** Controls before the send button: attach, model picker, mode toggles. */
  readonly toolbar?: ReactNode;
  /** The textarea grows with its content up to this many lines, then scrolls. Default 8. */
  readonly maxRows?: number;
  readonly textareaRef?: Ref<HTMLTextAreaElement>;
  readonly labels?: Partial<PromptInputLabels>;
}

export const PromptInput = forwardRef<HTMLFormElement, PromptInputProps>(function PromptInput(
  { className, disabled = false, labels, maxRows = 8, onStop, onSubmit, onValueChange, placeholder, status = "ready", submitOn = "enter", textareaRef, toolbar, value, ...props },
  ref,
) {
  const t = { ...DEFAULT_PROMPT_INPUT_LABELS, ...labels };
  const area = useRef<HTMLTextAreaElement | null>(null);
  const setArea = useCallback((node: HTMLTextAreaElement | null) => { area.current = node; assignRef(textareaRef, node); }, [textareaRef]);
  const busy = status === "submitted" || status === "streaming";
  const canSend = !disabled && !busy && value.trim() !== "";
  useIsomorphicLayoutEffect(() => {
    const node = area.current;
    if (node === null || typeof window === "undefined") return;
    node.style.blockSize = "auto";
    const lineHeight = Number.parseFloat(window.getComputedStyle(node).lineHeight) || 20;
    const cap = lineHeight * maxRows;
    node.style.blockSize = `${Math.min(node.scrollHeight, cap)}px`;
    node.style.overflowY = node.scrollHeight > cap ? "auto" : "hidden";
  }, [value, maxRows]);
  const send = (): void => { if (canSend) onSubmit(value); };
  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => { event.preventDefault(); send(); };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    // An IME is still composing (Korean, Japanese, Chinese): Enter confirms the syllable, not the message.
    if (event.key !== "Enter" || event.nativeEvent.isComposing || event.keyCode === 229) return;
    const modifier = event.metaKey || event.ctrlKey;
    if (submitOn === "enter" ? event.shiftKey : !modifier) return;
    event.preventDefault();
    send();
  };
  return (
    <form {...props} ref={ref} onSubmit={onFormSubmit} className={cx("cdt-prompt-input", disabled && "cdt-prompt-input--disabled", className)}>
      <textarea ref={setArea} rows={1} value={value} disabled={disabled} placeholder={placeholder} aria-label={t.input} className="cdt-prompt-input__textarea" onChange={(event) => onValueChange(event.currentTarget.value)} onKeyDown={onKeyDown} />
      <div className="cdt-prompt-input__footer">
        <div className="cdt-prompt-input__toolbar">{toolbar}</div>
        {busy
          ? <Button type="button" size="sm" disabled={onStop === undefined} onClick={onStop}>{t.stop}</Button>
          : <Button type="submit" size="sm" variant="primary" disabled={!canSend}>{t.submit}</Button>}
      </div>
    </form>
  );
});
PromptInput.displayName = "PromptInput";

/* ─── Reasoning ────────────────────────────────────────────────────────────────────────────── */

export interface ReasoningProps extends Omit<ComponentPropsWithoutRef<typeof RadixCollapsible.Root>, "children"> {
  /** While true the block opens itself and the trigger shimmers; when it turns false it closes once. */
  readonly streaming?: boolean;
  /** How long the model reasoned, in whole seconds, for the closed label. */
  readonly duration?: number;
  readonly children: ReactNode;
  readonly labels?: Partial<ReasoningLabels>;
}

export const Reasoning = forwardRef<HTMLDivElement, ReasoningProps>(function Reasoning({ children, className, defaultOpen, duration, labels, onOpenChange, open: openProp, streaming = false, ...props }, ref) {
  const t = { ...DEFAULT_REASONING_LABELS, ...labels };
  const [openState, setOpenState] = useState(defaultOpen ?? streaming);
  const open = openProp ?? openState;
  const setOpen = (next: boolean): void => { setOpenState(next); onOpenChange?.(next); };
  const wasStreaming = useRef(streaming);
  useEffect(() => {
    if (streaming && !wasStreaming.current) setOpen(true);
    if (!streaming && wasStreaming.current) setOpen(false);
    wasStreaming.current = streaming;
    // Only a change in `streaming` moves the state; the person's own toggles stay theirs.
  }, [streaming]);
  return (
    <RadixCollapsible.Root {...props} ref={ref} open={open} onOpenChange={setOpen} className={cx("cdt-reasoning", className)}>
      <RadixCollapsible.Trigger className="cdt-reasoning__trigger">
        {streaming ? <Shimmer>{t.thinking}</Shimmer> : <span>{t.thought(duration)}</span>}
        <span className="cdt-reasoning__chevron" aria-hidden="true">▾</span>
      </RadixCollapsible.Trigger>
      <RadixCollapsible.Content className="cdt-reasoning__content">{children}</RadixCollapsible.Content>
    </RadixCollapsible.Root>
  );
});
Reasoning.displayName = "Reasoning";

/* ─── Tool ─────────────────────────────────────────────────────────────────────────────────── */

export type ToolStatus = "pending" | "running" | "awaiting-approval" | "completed" | "error";
const TOOL_TONES: Readonly<Record<ToolStatus, Tone>> = { pending: "neutral", running: "info", "awaiting-approval": "warning", completed: "success", error: "danger" };

export interface ToolProps extends Omit<ComponentPropsWithoutRef<typeof RadixCollapsible.Root>, "children"> {
  /** The tool's name as the agent called it, shown in monospace. */
  readonly name: string;
  readonly status: ToolStatus;
  /** The call's arguments. Objects are shown as indented JSON. */
  readonly input?: unknown;
  /** The result. Strings and objects go in a code block; a React node renders as given. */
  readonly output?: unknown;
  readonly errorText?: ReactNode;
  /** Extra content after the result, such as a Confirmation while the call awaits approval. */
  readonly children?: ReactNode;
  /** `status` merges per key, so one status can be renamed without restating the others. */
  readonly labels?: Partial<Omit<ToolLabels, "status">> & { readonly status?: Partial<ToolLabels["status"]> };
}

function asCode(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2) ?? String(value);
}
function isPlainData(value: unknown): boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || Array.isArray(value) || (typeof value === "object" && value !== null && !("$$typeof" in value));
}

export const Tool = forwardRef<HTMLDivElement, ToolProps>(function Tool({ children, className, errorText, input, labels, name, output, status, ...props }, ref) {
  const t = { ...DEFAULT_TOOL_LABELS, ...labels, status: { ...DEFAULT_TOOL_LABELS.status, ...labels?.status } };
  return (
    <RadixCollapsible.Root {...props} ref={ref} className={cx("cdt-tool", `cdt-tool--${status}`, className)}>
      <RadixCollapsible.Trigger className="cdt-tool__trigger">
        <code className="cdt-tool__name">{name}</code>
        <Badge tone={TOOL_TONES[status]}>{t.status[status]}</Badge>
        <span className="cdt-tool__chevron" aria-hidden="true">▾</span>
      </RadixCollapsible.Trigger>
      <RadixCollapsible.Content className="cdt-tool__content">
        {input === undefined ? null : <section className="cdt-tool__section"><h4 className="cdt-tool__heading">{t.parameters}</h4><CodeBlock code={asCode(input)} language="json" aria-label={`${name} ${t.parameters}`} /></section>}
        {output === undefined ? null : <section className="cdt-tool__section"><h4 className="cdt-tool__heading">{t.result}</h4>{isPlainData(output) ? <CodeBlock code={asCode(output)} aria-label={`${name} ${t.result}`} /> : output as ReactNode}</section>}
        {errorText === undefined ? null : <section className="cdt-tool__section"><h4 className="cdt-tool__heading">{t.error}</h4><div className="cdt-tool__error">{errorText}</div></section>}
        {children}
      </RadixCollapsible.Content>
    </RadixCollapsible.Root>
  );
});
Tool.displayName = "Tool";

/* ─── Confirmation ─────────────────────────────────────────────────────────────────────────── */

export type ConfirmationState = "pending" | "approved" | "rejected";

export interface ConfirmationProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly state: ConfirmationState;
  readonly onApprove?: () => void;
  readonly onReject?: () => void;
  /** Disables both buttons while the decision is being sent. */
  readonly busy?: boolean;
  readonly labels?: Partial<ConfirmationLabels>;
}

/**
 * An inline approval request inside a conversation: the agent paused and waits for a person. It does
 * not trap focus or cover the page — use AlertDialog when nothing else may happen until the answer.
 */
export const Confirmation = forwardRef<HTMLElement, ConfirmationProps>(function Confirmation({ busy = false, children, className, description, labels, onApprove, onReject, state, title, ...props }, ref) {
  const t = { ...DEFAULT_CONFIRMATION_LABELS, ...labels };
  const titleId = useId();
  return (
    <section {...props} ref={ref} aria-labelledby={titleId} className={cx("cdt-confirmation", `cdt-confirmation--${state}`, className)}>
      <h4 id={titleId} className="cdt-confirmation__title">{title}</h4>
      {description === undefined ? null : <p className="cdt-confirmation__description">{description}</p>}
      {children}
      {state === "pending"
        ? <div className="cdt-confirmation__actions"><Button size="sm" variant="primary" disabled={busy || onApprove === undefined} onClick={onApprove}>{t.approve}</Button><Button size="sm" tone="danger" disabled={busy || onReject === undefined} onClick={onReject}>{t.reject}</Button></div>
        : <Badge tone={state === "approved" ? "success" : "danger"} className="cdt-confirmation__outcome">{state === "approved" ? t.approved : t.rejected}</Badge>}
    </section>
  );
});
Confirmation.displayName = "Confirmation";

/* ─── Sources and InlineCitation ───────────────────────────────────────────────────────────── */

export interface SourceItem {
  readonly href: string;
  readonly title: string;
  readonly description?: string;
}

export interface SourcesProps extends Omit<ComponentPropsWithoutRef<typeof RadixCollapsible.Root>, "children"> {
  readonly sources: readonly SourceItem[];
  readonly labels?: Partial<SourcesLabels>;
}

export const Sources = forwardRef<HTMLDivElement, SourcesProps>(function Sources({ className, labels, sources, ...props }, ref) {
  const t = { ...DEFAULT_SOURCES_LABELS, ...labels };
  if (sources.length === 0) return null;
  return (
    <RadixCollapsible.Root {...props} ref={ref} className={cx("cdt-sources", className)}>
      <RadixCollapsible.Trigger className="cdt-sources__trigger">{t.summary(sources.length)}<span className="cdt-sources__chevron" aria-hidden="true">▾</span></RadixCollapsible.Trigger>
      <RadixCollapsible.Content className="cdt-sources__content">
        <ol className="cdt-sources__list">{sources.map((source) => <li key={source.href}><a className="cdt-sources__link" href={source.href} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ol>
      </RadixCollapsible.Content>
    </RadixCollapsible.Root>
  );
});
Sources.displayName = "Sources";

export interface InlineCitationProps extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  /** The citation number shown in the text, starting at 1. */
  readonly index: number;
  readonly source: SourceItem;
  readonly labels?: Partial<InlineCitationLabels>;
}

/** A numbered marker inside answer text; it opens a popover naming and linking its source. */
export const InlineCitation = forwardRef<HTMLButtonElement, InlineCitationProps>(function InlineCitation({ className, index, labels, source, ...props }, ref) {
  const t = { ...DEFAULT_INLINE_CITATION_LABELS, ...labels };
  const closeAutoFocus = useRouteCloseAutoFocus(undefined);
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger {...props} ref={ref} aria-label={t.citation(index, source.title)} className={cx("cdt-inline-citation", className)}>{index}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content className="cdt-popover cdt-inline-citation__card" sideOffset={6} onCloseAutoFocus={closeAutoFocus}>
          <a className="cdt-inline-citation__title" href={source.href} target="_blank" rel="noopener noreferrer">{source.title}</a>
          {source.description === undefined ? null : <p className="cdt-inline-citation__description">{source.description}</p>}
          <span className="cdt-inline-citation__href">{source.href}</span>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
});
InlineCitation.displayName = "InlineCitation";

/* ─── Suggestions ──────────────────────────────────────────────────────────────────────────── */

export interface SuggestionsProps extends HTMLAttributes<HTMLDivElement> {
  readonly labels?: Partial<SuggestionsLabels>;
}

/** A row of follow-up prompts the person can send with one click. */
export const Suggestions = forwardRef<HTMLDivElement, SuggestionsProps>(function Suggestions({ className, labels, ...props }, ref) {
  const t = { ...DEFAULT_SUGGESTIONS_LABELS, ...labels };
  return <div role="group" aria-label={t.group} {...props} ref={ref} className={cx("cdt-suggestions", className)} />;
});
Suggestions.displayName = "Suggestions";

export interface SuggestionProps extends Omit<ComponentPropsWithoutRef<"button">, "onSelect" | "children"> {
  readonly suggestion: string;
  readonly onSelect: (suggestion: string) => void;
  /** What the chip shows, when it differs from the text it sends. */
  readonly children?: ReactNode;
}

export const Suggestion = forwardRef<HTMLButtonElement, SuggestionProps>(function Suggestion({ children, className, onSelect, suggestion, type = "button", ...props }, ref) {
  return <button {...props} ref={ref} type={type} className={cx("cdt-suggestion", className)} onClick={() => onSelect(suggestion)}>{children ?? suggestion}</button>;
});
Suggestion.displayName = "Suggestion";
