// FR 범위: FR-CMP-005, FR-A11Y-001, FR-A11Y-002
import {
  forwardRef,
  useEffect,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { cx } from "./cx";

export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  readonly caption?: ReactNode;
  readonly scrollContainerProps?: HTMLAttributes<HTMLDivElement>;
  readonly children: ReactNode;
}

const TableHead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableHead(
  { className, ...props },
  ref,
) {
  return <thead {...props} ref={ref} className={cx("cdt-table__head", className)} />;
});
TableHead.displayName = "Table.Head";

const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableBody(
  { className, ...props },
  ref,
) {
  return <tbody {...props} ref={ref} className={cx("cdt-table__body", className)} />;
});
TableBody.displayName = "Table.Body";

const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(function TableRow(
  { className, ...props },
  ref,
) {
  return <tr {...props} ref={ref} className={cx("cdt-table__row", className)} />;
});
TableRow.displayName = "Table.Row";

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  readonly scope?: "col" | "row";
}
const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(function TableHeaderCell(
  { className, scope = "col", ...props },
  ref,
) {
  return <th {...props} ref={ref} scope={scope} className={cx("cdt-table__header-cell", className)} />;
});
TableHeaderCell.displayName = "Table.HeaderCell";

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  readonly numeric?: boolean;
}
const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, numeric = false, ...props },
  ref,
) {
  return <td {...props} ref={ref} className={cx("cdt-table__cell", numeric && "cdt-num", className)} />;
});
TableCell.displayName = "Table.Cell";

type TableComponent = ReturnType<typeof forwardRef<HTMLDivElement, TableProps>> & {
  readonly Head: typeof TableHead;
  readonly Body: typeof TableBody;
  readonly Row: typeof TableRow;
  readonly HeaderCell: typeof TableHeaderCell;
  readonly Cell: typeof TableCell;
};

export const Table = Object.assign(forwardRef<HTMLDivElement, TableProps>(function Table(
  { "aria-label": ariaLabel, caption, children, className, scrollContainerProps, ...props },
  ref,
) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && caption == null && ariaLabel === undefined) {
      console.warn("[conductor] Table requires a caption or aria-label.");
    }
  }, [ariaLabel, caption]);

  return (
    <div {...scrollContainerProps} {...props} ref={ref} tabIndex={props.tabIndex ?? scrollContainerProps?.tabIndex ?? 0} aria-label={ariaLabel} className={cx("cdt-table__scroll", scrollContainerProps?.className, className)}>
      <table aria-label={ariaLabel} className="cdt-table">
        {caption == null ? null : <caption>{caption}</caption>}
        {children}
      </table>
    </div>
  );
}), { Head: TableHead, Body: TableBody, Row: TableRow, HeaderCell: TableHeaderCell, Cell: TableCell }) as TableComponent;

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  readonly children: ReactNode;
}

export interface TimelineStepProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  readonly onSelect?: () => void;
  readonly selected?: boolean;
  readonly marker?: ReactNode;
  readonly children: ReactNode;
}

const TimelineStep = forwardRef<HTMLLIElement, TimelineStepProps>(function TimelineStep(
  { children, className, marker, onSelect, selected = false, ...props },
  ref,
) {
  const stepClassName = cx("cdt-timeline__step", onSelect !== undefined && "cdt-timeline__step--interactive", className);
  const markerNode = <span className="cdt-timeline__marker" aria-hidden="true">{marker}</span>;
  const content = <>{markerNode}{children}</>;
  return (
    <li ref={ref}>
      {onSelect === undefined
        ? <div {...props} aria-current={selected ? "step" : undefined} className={stepClassName}>{content}</div>
        : <button {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} type="button" aria-current={selected ? "step" : undefined} onClick={() => onSelect()} className={stepClassName}>{content}</button>}
    </li>
  );
});
TimelineStep.displayName = "Timeline.Step";

type TimelineComponent = ReturnType<typeof forwardRef<HTMLOListElement, TimelineProps>> & { readonly Step: typeof TimelineStep };

export const Timeline = Object.assign(forwardRef<HTMLOListElement, TimelineProps>(function Timeline(
  { className, ...props },
  ref,
) {
  return <ol {...props} ref={ref} className={cx("cdt-timeline", className)} />;
}), { Step: TimelineStep }) as TimelineComponent;

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  readonly code: string;
  readonly language?: string;
}

export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  { className, code, language, ...props },
  ref,
) {
  return (
    <div {...props} ref={ref} role="region" tabIndex={0} data-language={language} className={cx("cdt-code-block", className)}>
      <pre className="cdt-code-block__pre"><code className="cdt-code-block__code">{code}</code></pre>
    </div>
  );
});
CodeBlock.displayName = "CodeBlock";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  readonly children: ReactNode;
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ className, ...props }, ref) {
  return <kbd {...props} ref={ref} className={cx("cdt-kbd", className)} />;
});
Kbd.displayName = "Kbd";
