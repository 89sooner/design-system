// CR-079 · FR-CMP-010 AC-8: what the search workbench example keeps for one history entry, so leaving for another
// page and coming back with the browser's Back restores the loaded range, the selection and the list position.
// The search criteria live in the URL; this is the rest of the session state. It is the consumer's job (CR-064), and
// this example is the reference for it: sessionStorage keyed by the router's history-entry key.

export interface WorkbenchSnapshot {
  /** The URL search the snapshot belongs to. A different search starts fresh. */
  readonly search: string;
  readonly limit: number;
  readonly selected: string | null;
  readonly scrollY: number;
  /** Synthetic demo controls, so a restored page shows the same rows. */
  readonly mode: string;
  readonly count: number;
}

const PREFIX = "conductor-workbench:";

/** sessionStorage when the browser allows it; a private window or blocked storage returns undefined. */
export function sessionStore(): Storage | undefined {
  try { return typeof window === "undefined" ? undefined : window.sessionStorage; } catch { return undefined; }
}

export function readSnapshot(storage: Storage | undefined, entry: string): WorkbenchSnapshot | null {
  try {
    const raw = storage?.getItem(PREFIX + entry);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<WorkbenchSnapshot>;
    if (typeof value.search !== "string" || typeof value.limit !== "number" || typeof value.scrollY !== "number") return null;
    return { search: value.search, limit: Math.max(1, Math.floor(value.limit)), selected: typeof value.selected === "string" ? value.selected : null, scrollY: Math.max(0, value.scrollY), mode: typeof value.mode === "string" ? value.mode : "ready", count: typeof value.count === "number" ? value.count : 100 };
  } catch { return null; }
}

export function writeSnapshot(storage: Storage | undefined, entry: string, snapshot: WorkbenchSnapshot): void {
  try { storage?.setItem(PREFIX + entry, JSON.stringify(snapshot)); } catch { /* full or blocked: Back then starts fresh */ }
}

/** A snapshot applies only to the same search; otherwise the page starts from the first rows with nothing selected. */
export function restorable(snapshot: WorkbenchSnapshot | null, search: string): snapshot is WorkbenchSnapshot {
  return snapshot !== null && snapshot.search === search;
}

/** The search part of a hash route (`#/examples/workbench?q=…`), which the example rewrites with replaceState. */
export function hashSearch(hash: string): string {
  const index = hash.indexOf("?");
  return index === -1 ? "" : hash.slice(index);
}

/**
 * Whether the hash still routes to `pathname`. A scroll frame queued just before leaving can run after the hash has
 * already moved on; saving then would file the next page's search and scroll under this entry, so it is skipped.
 */
export function onPage(hash: string, pathname: string): boolean {
  const route = hash.replace(/^#/, "");
  const index = route.indexOf("?");
  return (index === -1 ? route : route.slice(0, index)) === pathname;
}
