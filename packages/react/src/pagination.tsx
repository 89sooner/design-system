"use client";
// FR-CMP-014 · CR-054: page navigation. Native buttons only, so the keyboard path is the browser's
// (Tab, Enter, Space); the current page is `aria-current="page"`, not a colour.
import { forwardRef, type HTMLAttributes } from "react";
import { Button } from "./action";
import { cx } from "./cx";
import { DEFAULT_PAGINATION_LABELS, type PaginationLabels } from "./labels";
import type { Size } from "./types";

export type PaginationItem = number | "ellipsis";

/**
 * The pages to show: the first, the last, `page` with `siblings` on each side, and an ellipsis for
 * each gap of two or more. A gap of exactly one page shows that page instead, since an ellipsis
 * would hide no more than the number it replaces. Out-of-range input is clamped.
 */
export function paginationRange(page: number, pageCount: number, siblings = 1): readonly PaginationItem[] {
  const count = Math.max(0, Math.floor(pageCount));
  if (count === 0) return [];
  const current = Math.min(count, Math.max(1, Math.floor(page)));
  const spread = Math.max(0, Math.floor(siblings));
  const start = Math.max(2, current - spread);
  const end = Math.min(count - 1, current + spread);
  const middle = Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  const head: PaginationItem[] = start > 3 ? ["ellipsis"] : start === 3 ? [2] : [];
  const tail: PaginationItem[] = end < count - 2 ? ["ellipsis"] : end === count - 2 ? [count - 1] : [];
  return count === 1 ? [1] : [1, ...head, ...middle, ...tail, count];
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  readonly page: number;
  readonly pageCount: number;
  readonly onPageChange: (page: number) => void;
  /** Pages shown on each side of the current one. Default 1. */
  readonly siblings?: number;
  readonly size?: Size;
  readonly labels?: Partial<PaginationLabels>;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination({ page, pageCount, onPageChange, siblings = 1, size = "sm", labels, className, ...props }, ref) {
  const t = { ...DEFAULT_PAGINATION_LABELS, ...labels };
  const items = paginationRange(page, pageCount, siblings);
  const last = Math.max(1, Math.floor(pageCount));
  return <nav aria-label={t.nav} {...props} ref={ref} className={cx("cdt-pagination", className)}>
    <ul className="cdt-pagination__list">
      <li><Button variant="ghost" size={size} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>{t.previous}</Button></li>
      {items.map((item, index) => item === "ellipsis"
        ? <li key={`ellipsis-${index}`} className="cdt-pagination__ellipsis" aria-hidden="true">…</li>
        : <li key={item}><Button variant={item === page ? "secondary" : "ghost"} size={size} aria-label={t.page(item)} aria-current={item === page ? "page" : undefined} className="cdt-pagination__page" onClick={() => { if (item !== page) onPageChange(item); }}>{item}</Button></li>)}
      <li><Button variant="ghost" size={size} disabled={page >= last} onClick={() => onPageChange(page + 1)}>{t.next}</Button></li>
    </ul>
  </nav>;
});
Pagination.displayName = "Pagination";
