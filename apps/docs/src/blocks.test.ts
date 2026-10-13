// Refs: CR-051 FR-DOC-009
import { describe, expect, it } from "vitest";
import { changedKeys, DESCRIPTION_MAX, emptyFilter, filterDeployments, isFiltered, NAME_MAX, resultSummary, sortBySeconds, toggleDirection, validateSettings, type Deployment, type Settings } from "./blocks";

const rows: readonly Deployment[] = [
  { id: "a", service: "web-console", environment: "production", status: "success", seconds: 42 },
  { id: "b", service: "event-worker", environment: "staging", status: "running", seconds: 18 },
  { id: "c", service: "Search-API", environment: "production", status: "danger", seconds: 42 },
];

describe("FR-DOC-009 AC-2: filter table rules", () => {
  it("matches the service name case-insensitively and ignores surrounding spaces", () => {
    expect(filterDeployments(rows, { query: "  search ", status: "all" }).map((row) => row.id)).toEqual(["c"]);
  });

  it("combines the text query with the status filter", () => {
    expect(filterDeployments(rows, { query: "e", status: "running" }).map((row) => row.id)).toEqual(["b"]);
    expect(filterDeployments(rows, emptyFilter)).toHaveLength(3);
  });

  it("sorts by duration in both directions and keeps ties in input order", () => {
    expect(sortBySeconds(rows, "ascending").map((row) => row.id)).toEqual(["b", "a", "c"]);
    expect(sortBySeconds(rows, "descending").map((row) => row.id)).toEqual(["a", "c", "b"]);
    expect(toggleDirection("ascending")).toBe("descending");
  });

  it("reports whether a filter is active and summarises the count", () => {
    expect(isFiltered(emptyFilter)).toBe(false);
    expect(isFiltered({ query: " ", status: "all" })).toBe(false);
    expect(isFiltered({ query: "", status: "danger" })).toBe(true);
    expect(resultSummary(3, 3)).toBe("Showing all 3");
    expect(resultSummary(1, 3)).toBe("Showing 1 of 3");
  });
});

const saved: Settings = { name: "Atlas", description: "", region: "seoul", emailAlerts: true, weeklyDigest: false };

describe("FR-DOC-009 AC-3: settings form rules", () => {
  it("requires a name and bounds the name and description lengths", () => {
    expect(validateSettings(saved)).toEqual({});
    expect(Object.keys(validateSettings({ ...saved, name: "   " }))).toEqual(["name"]);
    expect(Object.keys(validateSettings({ ...saved, name: "a".repeat(NAME_MAX + 1), description: "b".repeat(DESCRIPTION_MAX + 1) }))).toEqual(["name", "description"]);
    expect(validateSettings({ ...saved, name: "a".repeat(NAME_MAX), description: "b".repeat(DESCRIPTION_MAX) })).toEqual({});
  });

  it("lists the changed fields against the saved values", () => {
    expect(changedKeys(saved, saved)).toEqual([]);
    expect(changedKeys(saved, { ...saved, region: "tokyo", weeklyDigest: true })).toEqual(["region", "weeklyDigest"]);
  });
});
