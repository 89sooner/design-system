// Refs: CR-051 FR-DOC-009 W-063 W-064 W-065
//
// Pure data rules behind the block examples. The screens only render what these return, so the
// filter, sort and validation behaviour is unit-tested without a browser (blocks.test.ts).
import type { Status } from "@conductor-by-89soone/react";

/* ---------- W-064 filter table ---------- */

export interface Deployment {
  readonly id: string;
  readonly service: string;
  readonly environment: "production" | "staging";
  readonly status: Status;
  readonly seconds: number;
}

export interface DeploymentFilter {
  readonly query: string;
  readonly status: Status | "all";
}

export type SortDirection = "ascending" | "descending";

export const emptyFilter: DeploymentFilter = { query: "", status: "all" };

const matchesQuery = (query: string) => (row: Deployment) =>
  row.service.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());

const matchesStatus = (status: DeploymentFilter["status"]) => (row: Deployment) =>
  status === "all" || row.status === status;

export function filterDeployments(rows: readonly Deployment[], filter: DeploymentFilter): readonly Deployment[] {
  return rows.filter(matchesQuery(filter.query)).filter(matchesStatus(filter.status));
}

/** Stable: rows with equal durations keep their input order in both directions. */
export function sortBySeconds(rows: readonly Deployment[], direction: SortDirection): readonly Deployment[] {
  const sign = direction === "ascending" ? 1 : -1;
  return rows.map((row, index) => ({ row, index }))
    .sort((a, b) => (a.row.seconds - b.row.seconds) * sign || a.index - b.index)
    .map(({ row }) => row);
}

export const toggleDirection = (direction: SortDirection): SortDirection =>
  direction === "ascending" ? "descending" : "ascending";

export const isFiltered = (filter: DeploymentFilter): boolean =>
  filter.query.trim() !== "" || filter.status !== "all";

export const resultSummary = (shown: number, total: number): string =>
  shown === total ? `Showing all ${total}` : `Showing ${shown} of ${total}`;

/* ---------- W-065 settings form ---------- */

export interface Settings {
  readonly name: string;
  readonly description: string;
  readonly region: "seoul" | "tokyo" | "virginia";
  readonly emailAlerts: boolean;
  readonly weeklyDigest: boolean;
}

export type SettingsErrors = Partial<Record<keyof Settings, string>>;

export const NAME_MAX = 40;
export const DESCRIPTION_MAX = 160;

export function validateSettings(settings: Settings): SettingsErrors {
  const name = settings.name.trim();
  return {
    ...(name === "" ? { name: "Enter a project name." } : name.length > NAME_MAX ? { name: `Use ${NAME_MAX} characters or fewer.` } : {}),
    ...(settings.description.length > DESCRIPTION_MAX ? { description: `Use ${DESCRIPTION_MAX} characters or fewer.` } : {}),
  };
}

/** Keys whose value differs from the saved settings, in declaration order. */
export function changedKeys(saved: Settings, draft: Settings): readonly (keyof Settings)[] {
  return (Object.keys(saved) as (keyof Settings)[]).filter((key) => saved[key] !== draft[key]);
}
